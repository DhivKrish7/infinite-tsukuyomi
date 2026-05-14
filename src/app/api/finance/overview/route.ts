import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/api";
import { financeManagementService } from "@/server/finance/services/finance-management-service";

export async function GET() {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const overview = await financeManagementService.getOverview(auth.user.tenantId);
  return NextResponse.json(overview);
}
