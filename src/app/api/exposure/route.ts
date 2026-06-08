import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/api";
import { exposureService } from "@/server/exposure/exposure-service";

export async function GET() {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  return NextResponse.json(await exposureService.getOverview(auth.user.tenantId));
}
