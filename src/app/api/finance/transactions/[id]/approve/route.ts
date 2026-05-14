import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { approveFinanceTransactionSchema } from "@/server/finance/api/validation";
import { financeManagementService } from "@/server/finance/services/finance-management-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = approveFinanceTransactionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { id } = await params;
  const transaction = await financeManagementService.decideTransaction({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    transactionId: id,
    ...parsed.data
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: `FINANCE_TRANSACTION_${parsed.data.decision}`,
    entity: "transaction",
    entityId: transaction.id,
    metadata: { comment: parsed.data.comment }
  });

  return NextResponse.json({ item: transaction });
}
