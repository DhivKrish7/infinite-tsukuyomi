import { NextRequest, NextResponse } from "next/server";
import { parseSearchParams, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { complianceCaseListSchema, createKycCaseSchema } from "@/server/compliance/api/validation";
import { complianceManagementService } from "@/server/compliance/services/compliance-management-service";

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = parseSearchParams(request, complianceCaseListSchema);
  if (!parsed.success) return validationError();

  const result = await complianceManagementService.listCases({
    tenantId: auth.user.tenantId,
    ...parsed.data
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createKycCaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const kycCase = await complianceManagementService.createCase({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    ...parsed.data
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "KYC_CASE_CREATED",
    entity: "kyc_case",
    entityId: kycCase.id,
    metadata: { clientId: kycCase.clientId }
  });

  return NextResponse.json({ item: kycCase }, { status: 201 });
}
