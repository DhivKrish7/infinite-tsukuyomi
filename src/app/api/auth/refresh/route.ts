import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { writeAuthAudit } from "@/lib/auth/audit";
import {
  createOpaqueToken,
  getRefreshTokenExpiresAt,
  hashToken,
  REFRESH_TOKEN_COOKIE,
  signAccessToken
} from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/request-context";
import { buildAccessPayload, serializeAuthUser, userAuthInclude } from "@/lib/auth/user-context";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    const response = NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: userAuthInclude
      }
    }
  });

  if (!storedToken) {
    const response = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  if (storedToken.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { familyId: storedToken.familyId, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    await writeAuthAudit({
      tenantId: storedToken.user.tenantId,
      actorId: storedToken.userId,
      action: "AUTH_REFRESH_REUSE_DETECTED",
      request
    });

    const response = NextResponse.json({ error: "Refresh token was reused" }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  if (storedToken.expiresAt <= new Date() || !storedToken.user.isActive) {
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });

    const response = NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  const context = getRequestContext(request);
  const newRefreshToken = createOpaqueToken();
  const newRefreshTokenHash = hashToken(newRefreshToken);
  const accessToken = await signAccessToken(buildAccessPayload(storedToken.user));

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
        replacedByHash: newRefreshTokenHash
      }
    }),
    prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newRefreshTokenHash,
        familyId: storedToken.familyId,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        expiresAt: getRefreshTokenExpiresAt()
      }
    })
  ]);

  await writeAuthAudit({
    tenantId: storedToken.user.tenantId,
    actorId: storedToken.userId,
    action: "AUTH_REFRESH_ROTATED",
    request
  });

  const response = NextResponse.json({ user: serializeAuthUser(storedToken.user) });
  setAuthCookies(response, accessToken, newRefreshToken);

  return response;
}
