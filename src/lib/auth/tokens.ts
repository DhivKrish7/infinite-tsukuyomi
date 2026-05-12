import { createHash, randomBytes, randomUUID } from "node:crypto";
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { env } from "@/config/env";

export const ACCESS_TOKEN_COOKIE = "nexus_access_token";
export const REFRESH_TOKEN_COOKIE = "nexus_refresh_token";

export type AccessTokenPayload = {
  sub: string;
  tenantId: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
};

function getSecret(value: string | undefined, fallback: string) {
  if (!value && env.NODE_ENV === "production") {
    throw new Error("Missing JWT secret");
  }

  return new TextEncoder().encode(value ?? fallback);
}

export function getAccessTokenMaxAge() {
  return env.AUTH_ACCESS_TOKEN_TTL_SECONDS;
}

export function getRefreshTokenMaxAge() {
  return env.AUTH_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;
}

export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + getRefreshTokenMaxAge() * 1000);
}

export function createOpaqueToken() {
  return randomBytes(48).toString("base64url");
}

export function createTokenFamilyId() {
  return randomUUID();
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${getAccessTokenMaxAge()}s`)
    .sign(getSecret(env.JWT_ACCESS_SECRET, "dev-access-secret-change-me"));
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret(env.JWT_ACCESS_SECRET, "dev-access-secret-change-me"));

  return {
    sub: String(payload.sub),
    tenantId: String(payload.tenantId),
    email: String(payload.email),
    name: String(payload.name),
    roles: Array.isArray(payload.roles) ? payload.roles.map(String) : [],
    permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : []
  } satisfies AccessTokenPayload;
}
