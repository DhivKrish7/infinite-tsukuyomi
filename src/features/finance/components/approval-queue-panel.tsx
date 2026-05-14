import { BadgeCheck, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceTransaction } from "../types";
import { formatMoney } from "../format";
import { FinanceStatusBadge } from "./finance-status-badge";

export function ApprovalQueuePanel({ transactions }: { transactions: FinanceTransaction[] }) {
  const pending = transactions.filter((transaction) =>
    transaction.approvals?.some((approval) => approval.status === "PENDING")
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Approvals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(pending.length ? pending : transactions.slice(0, 4)).map((transaction) => {
          const approval = transaction.approvals?.[0];

          return (
            <div key={transaction.id} className="rounded-lg border border-white/10 bg-secondary/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
                    {approval?.status === "PENDING" ? (
                      <Clock3 className="h-4 w-4 text-trading-amber" />
                    ) : (
                      <BadgeCheck className="h-4 w-4 text-trading-green" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.client.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {transaction.type} / {approval?.step?.replaceAll("_", " ") ?? "NO STEP"}
                    </div>
                  </div>
                </div>
                <FinanceStatusBadge value={approval?.status ?? transaction.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{transaction.reference}</span>
                <span className="font-medium">{formatMoney(transaction.amount, transaction.currency)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
