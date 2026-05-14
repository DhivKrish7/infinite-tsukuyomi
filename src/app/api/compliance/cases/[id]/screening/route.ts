import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, writeCrmAudit } from "@/lib/crm/api";
import { complianceManagementService } from "@/server/compliance/services/compliance-management-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const { id } = await params;
  const screening = await complianceManagementService.runScreening({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    kycCaseId: id,
    providerConnectionId: typeof body.providerConnectionId === "string" ? body.providerConnectionId : undefined
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "SANCTIONS_SCREENING_RUN",
    entity: "sanctions_screening",
    entityId: screening.id,
    metadata: { kycCaseId: id, status: screening.status, riskScore: screening.riskScore }
  });

  return NextResponse.json({ item: screening }, { status: 201 });
}
