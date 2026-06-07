import { NextRequest, NextResponse } from "next/server";
import { PERMISSION } from "@/lib/auth/rbac";
import { getRequestContext } from "@/lib/request-context";
import { requireManagementUser } from "@/features/management/server/auth";
import { managementService } from "@/features/management/server/services";
import { permissionGroupInputSchema } from "@/features/management/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireManagementUser(PERMISSION.PERMISSION_GROUPS_MANAGE);
  if ("response" in auth) return auth.response;

  const parsed = permissionGroupInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });

  const result = await managementService.updatePermissionGroup(
    auth.user,
    (await params).id,
    parsed.data,
    getRequestContext(request).ipAddress
  );
  return result ? NextResponse.json(result) : NextResponse.json({ error: "Permission group not found" }, { status: 404 });
}
