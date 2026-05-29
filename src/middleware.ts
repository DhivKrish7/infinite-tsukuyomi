import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";
import { routePermissionPolicy, routeRolePolicy } from "@/lib/auth/rbac";

const ACCESS_TOKEN_COOKIE = "nexus_access_token";
const REFRESH_TOKEN_COOKIE = "nexus_refresh_token";
const AUTH_PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];
const PUBLIC_FILE = /\.(.*)$/;

function getSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("Missing JWT_ACCESS_SECRET");
  }

  return new TextEncoder().encode(secret ?? "dev-access-secret-change-me");
}

function isPublicPath(pathname: string) {
  return (
    AUTH_PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  );
}

function getRequiredRoles(pathname: string) {
  const match = Object.entries(routeRolePolicy).find(([prefix]) => pathname.startsWith(prefix));
  return match?.[1] ?? [];
}

function getRequiredPermissions(pathname: string) {
  const match = routePermissionPolicy.find((policy) => pathname.startsWith(policy.prefix));
  return match?.permissions ?? [];
}

function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]) {
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const isPublic = isPublicPath(pathname);

  if (isPublic && !token) {
    return NextResponse.next();
  }

  if (!token) {
    if (refreshToken && !pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const roles = Array.isArray(payload.roles) ? payload.roles.map(String) : [];
    const permissions = Array.isArray(payload.permissions) ? payload.permissions.map(String) : [];

    if (AUTH_PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const requiredRoles = getRequiredRoles(pathname);
    const allowed =
      requiredRoles.length === 0 ||
      roles.includes("SUPER_ADMIN") ||
      requiredRoles.some((role) => roles.includes(role));

    if (!allowed) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    const requiredPermissions = getRequiredPermissions(pathname);
    const permissionAllowed =
      requiredPermissions.length === 0 ||
      roles.includes("SUPER_ADMIN") ||
      hasAnyPermission(permissions, requiredPermissions);

    if (!permissionAllowed) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", String(payload.sub));
    response.headers.set("x-tenant-id", String(payload.tenantId));
    return response;
  } catch {
    if (refreshToken && !pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
