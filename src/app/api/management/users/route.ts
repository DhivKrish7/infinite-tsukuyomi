import { NextResponse } from "next/server";
import { PERMISSION } from "@/lib/auth/rbac";
import { requireManagementUser } from "@/features/management/server/auth";
import { managementService } from "@/features/management/server/services";

export async function GET() {
  const auth = await requireManagementUser(PERMISSION.USERS_MANAGE);
  if ("response" in auth) return auth.response;

  return NextResponse.json(await managementService.listUsers(auth.user));
}
