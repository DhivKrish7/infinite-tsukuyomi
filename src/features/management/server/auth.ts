import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, PERMISSION, type PermissionKey } from "@/lib/auth/rbac";

export type ManagementUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireManagementUser(permission: PermissionKey = PERMISSION.MANAGEMENT_READ) {
  const user = await getCurrentUser();

  if (!user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!hasPermission(user, permission)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}
