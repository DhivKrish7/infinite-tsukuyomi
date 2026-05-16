import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/api";
import { analyticsService } from "@/server/analytics/services/analytics-service";

export async function GET() {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const overview = await analyticsService.getOverview(auth.user.tenantId);
  return NextResponse.json(overview);
}
