import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { writeAuthAudit } from "@/lib/auth/audit";
import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

const resetPasswordSchema = z.object({
  token: z.string().min(24),
  password: z.string().min(12, "Password must be at least 12 characters")
});

export async function POST(request: NextRequest) {
  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password reset payload" }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date() || !resetToken.user.isActive) {
    return NextResponse.json({ error: "Password reset token is invalid or expired" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    }),
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  ]);

  await writeAuthAudit({
    tenantId: resetToken.user.tenantId,
    actorId: resetToken.userId,
    action: "AUTH_PASSWORD_RESET_COMPLETED",
    request
  });

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);

  return response;
}
