import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/api";
import { reportService } from "@/server/reports/report-service";

export async function GET() {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  return NextResponse.json(await reportService.listHistory(auth.user.tenantId));
}
