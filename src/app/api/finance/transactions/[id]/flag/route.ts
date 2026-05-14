import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { flagFinanceTransactionSchema } from "@/server/finance/api/validation";
import { financeManagementService } from "@/server/finance/services/finance-management-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = flagFinanceTransactionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { id } = await params;
  const flag = await financeManagementService.flagTransaction({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    transactionId: id,
    ...parsed.data
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "FINANCE_TRANSACTION_FLAGGED",
    entity: "transaction",
    entityId: id,
    metadata: { flagId: flag.id, severity: flag.severity, reason: flag.reason }
  });

  return NextResponse.json({ item: flag }, { status: 201 });
}
