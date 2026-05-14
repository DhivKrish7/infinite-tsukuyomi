import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { uploadKycDocumentSchema } from "@/server/compliance/api/validation";
import { complianceManagementService } from "@/server/compliance/services/compliance-management-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = uploadKycDocumentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { id } = await params;
  const document = await complianceManagementService.uploadDocument({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    kycCaseId: id,
    ...parsed.data
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "KYC_DOCUMENT_UPLOADED",
    entity: "kyc_document",
    entityId: document.id,
    metadata: { kycCaseId: id, type: document.type }
  });

  return NextResponse.json({ item: document }, { status: 201 });
}
