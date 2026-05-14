import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { reviewKycCaseSchema } from "@/server/compliance/api/validation";
import { complianceManagementService } from "@/server/compliance/services/compliance-management-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = reviewKycCaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { id } = await params;
  const kycCase = await complianceManagementService.reviewCase({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    kycCaseId: id,
    ...parsed.data
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: `KYC_REVIEW_${parsed.data.status}`,
    entity: "kyc_case",
    entityId: kycCase.id,
    metadata: { riskScore: kycCase.riskScore, riskLevel: kycCase.riskLevel }
  });

  return NextResponse.json({ item: kycCase });
}
