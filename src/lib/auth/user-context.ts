import type { Prisma } from "@prisma/client";
import type { AccessTokenPayload } from "./tokens";

export const userAuthInclude = {
  tenant: true,
  userRoles: {
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.UserInclude;

export type UserWithAuth = Prisma.UserGetPayload<{
  include: typeof userAuthInclude;
}>;

export function buildAccessPayload(user: UserWithAuth): AccessTokenPayload {
  const roles = user.userRoles.map((userRole) => userRole.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.permissions.map((rolePermission) => rolePermission.permission.key)
      )
    )
  );

  return {
    sub: user.id,
    tenantId: user.tenantId,
    email: user.email,
    name: user.name,
    roles,
    permissions
  };
}

export function serializeAuthUser(user: UserWithAuth) {
  const payload = buildAccessPayload(user);

  return {
    id: user.id,
    tenantId: user.tenantId,
    tenantSlug: user.tenant.slug,
    email: user.email,
    name: user.name,
    roles: payload.roles,
    permissions: payload.permissions
  };
}
