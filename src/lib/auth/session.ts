import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "./tokens";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) return null;

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session) return null;

  const user = await prisma.user.findFirst({
    where: {
      id: session.sub,
      tenantId: session.tenantId,
      isActive: true
    },
    include: {
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
    }
  });

  if (!user) return null;

  const roles = user.userRoles.map((userRole) => userRole.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.permissions.map((rolePermission) => rolePermission.permission.key)
      )
    )
  );

  return {
    id: user.id,
    tenantId: user.tenantId,
    tenantSlug: user.tenant.slug,
    email: user.email,
    name: user.name,
    roles,
    permissions
  };
}
