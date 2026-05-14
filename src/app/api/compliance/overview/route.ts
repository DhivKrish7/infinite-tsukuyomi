import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/api";
import { complianceManagementService } from "@/server/compliance/services/compliance-management-service";

export async function GET() {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const overview = await complianceManagementService.getOverview(auth.user.tenantId);
  return NextResponse.json(overview);
}
