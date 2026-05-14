import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { createComplianceNoteSchema } from "@/server/compliance/api/validation";
import { complianceManagementService } from "@/server/compliance/services/compliance-management-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createComplianceNoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { id } = await params;
  const note = await complianceManagementService.createNote({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    kycCaseId: id,
    ...parsed.data
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "COMPLIANCE_NOTE_CREATED",
    entity: "compliance_note",
    entityId: note.id,
    metadata: { kycCaseId: id, visibility: note.visibility }
  });

  return NextResponse.json({ item: note }, { status: 201 });
}
