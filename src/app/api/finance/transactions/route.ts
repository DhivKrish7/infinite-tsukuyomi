import { NextRequest, NextResponse } from "next/server";
import { parseSearchParams, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import {
  createFinanceTransactionSchema,
  financeTransactionListSchema
} from "@/server/finance/api/validation";
import { financeManagementService } from "@/server/finance/services/finance-management-service";

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = parseSearchParams(request, financeTransactionListSchema);
  if (!parsed.success) return validationError();

  const result = await financeManagementService.listTransactions({
    tenantId: auth.user.tenantId,
    ...parsed.data
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createFinanceTransactionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const transaction = await financeManagementService.createTransaction({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    ...parsed.data
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "FINANCE_TRANSACTION_CREATED",
    entity: "transaction",
    entityId: transaction.id,
    metadata: { type: transaction.type, amount: transaction.amount.toString(), currency: transaction.currency }
  });

  return NextResponse.json({ item: transaction }, { status: 201 });
}
