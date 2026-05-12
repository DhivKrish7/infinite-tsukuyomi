import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";
import { writeAuthAudit } from "@/lib/auth/audit";
import { checkMemoryRateLimit } from "@/lib/auth/rate-limit";
import { createOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/request-context";

const forgotPasswordSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  tenantSlug: z.string().min(1).default("default")
});

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);
  const rateLimit = checkMemoryRateLimit(`forgot-password:${context.ipAddress}`, 8, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many password reset requests" }, { status: 429 });
  }

  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password reset payload" }, { status: 400 });
  }

  const { email, tenantSlug } = parsed.data;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  const user = tenant
    ? await prisma.user.findFirst({
        where: { tenantId: tenant.id, email, isActive: true }
      })
    : null;

  let resetUrl: string | undefined;

  if (user) {
    const resetToken = createOpaqueToken();

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(resetToken),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    });

    resetUrl = `${env.PASSWORD_RESET_BASE_URL}?token=${resetToken}&tenant=${tenantSlug}`;

    await writeAuthAudit({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "AUTH_PASSWORD_RESET_REQUESTED",
      metadata: { email },
      request
    });
  }

  return NextResponse.json({
    ok: true,
    message: "If that account exists, password reset instructions have been prepared.",
    resetUrl: env.NODE_ENV === "production" ? undefined : resetUrl
  });
}
