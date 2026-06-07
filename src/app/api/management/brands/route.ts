import { NextRequest, NextResponse } from "next/server";
import { PERMISSION } from "@/lib/auth/rbac";
import { getRequestContext } from "@/lib/request-context";
import { requireManagementUser } from "@/features/management/server/auth";
import { managementService } from "@/features/management/server/services";
import { brandInputSchema } from "@/features/management/validation";

export async function GET() {
  const auth = await requireManagementUser(PERMISSION.MANAGEMENT_READ);
  if ("response" in auth) return auth.response;

  return NextResponse.json(await managementService.listBrands(auth.user));
}

export async function POST(request: NextRequest) {
  const auth = await requireManagementUser(PERMISSION.BRANDS_MANAGE);
  if ("response" in auth) return auth.response;

  const parsed = brandInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });

  return NextResponse.json(await managementService.createBrand(auth.user, parsed.data, getRequestContext(request).ipAddress), {
    status: 201
  });
}
