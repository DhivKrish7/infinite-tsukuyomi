import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { writeAuthAudit } from "@/lib/auth/audit";
import { verifyPassword } from "@/lib/auth/password";
import {
  createOpaqueToken,
  createTokenFamilyId,
  getRefreshTokenExpiresAt,
  hashToken,
  signAccessToken
} from "@/lib/auth/tokens";
import { buildAccessPayload, serializeAuthUser, userAuthInclude } from "@/lib/auth/user-context";
import { getRequestContext } from "@/lib/request-context";
import { checkMemoryRateLimit } from "@/lib/auth/rate-limit";

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
  tenantSlug: z.string().min(1).default("default")
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);
  const rateLimit = checkMemoryRateLimit(`login:${context.ipAddress}`, 20, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  const { email, password, tenantSlug } = parsed.data;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });

  const user = tenant
    ? await prisma.user.findFirst({
        where: { tenantId: tenant.id, email },
        include: userAuthInclude
      })
    : null;

  if (!tenant || !user) {
    await writeAuthAudit({
      tenantId: tenant?.id,
      action: "AUTH_LOGIN_FAILED",
      metadata: { email, reason: "invalid_credentials" },
      request
    });

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (!user.isActive) {
    await writeAuthAudit({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "AUTH_LOGIN_BLOCKED",
      metadata: { reason: "inactive_user" },
      request
    });

    return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await writeAuthAudit({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "AUTH_LOGIN_BLOCKED",
      metadata: { reason: "locked", lockedUntil: user.lockedUntil.toISOString() },
      request
    });

    return NextResponse.json({ error: "Account is temporarily locked" }, { status: 423 });
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      failedLoginAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts,
        lockedUntil
      }
    });

    await writeAuthAudit({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "AUTH_LOGIN_FAILED",
      metadata: { reason: "invalid_password", failedLoginAttempts, lockedUntil },
      request
    });

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const refreshToken = createOpaqueToken();
  const refreshTokenHash = hashToken(refreshToken);
  const accessToken = await signAccessToken(buildAccessPayload(user));

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId: createTokenFamilyId(),
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        expiresAt: getRefreshTokenExpiresAt()
      }
    })
  ]);

  await writeAuthAudit({
    tenantId: user.tenantId,
    actorId: user.id,
    action: "AUTH_LOGIN_SUCCEEDED",
    metadata: { email },
    request
  });

  const response = NextResponse.json({ user: serializeAuthUser(user) });
  clearAuthCookies(response);
  setAuthCookies(response, accessToken, refreshToken);

  return response;
}
