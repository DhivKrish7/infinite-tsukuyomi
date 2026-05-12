import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { writeAuthAudit } from "@/lib/auth/audit";
import { getCurrentSession } from "@/lib/auth/session";
import { hashToken, REFRESH_TOKEN_COOKIE } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  await writeAuthAudit({
    tenantId: session?.tenantId,
    actorId: session?.sub,
    action: "AUTH_LOGOUT",
    request
  });

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);

  return response;
}
