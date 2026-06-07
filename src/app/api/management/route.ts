import { NextResponse } from "next/server";
import { requireManagementUser } from "@/features/management/server/auth";
import { managementService } from "@/features/management/server/services";

export async function GET() {
  const auth = await requireManagementUser();
  if ("response" in auth) return auth.response;

  return NextResponse.json(await managementService.getOverview(auth.user));
}
