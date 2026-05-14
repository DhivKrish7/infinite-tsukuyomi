import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceTransaction } from "../types";
import { formatDateTime, formatMoney } from "../format";
import { FinanceStatusBadge } from "./finance-status-badge";

export function TransactionLedgerTable({ transactions }: { transactions: FinanceTransaction[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Transaction Ledger</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Transaction</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Fees</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Risk</th>
              <th className="px-5 py-3 font-medium">Gateway</th>
              <th className="px-5 py-3 font-medium">Requested</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const Icon = transaction.type === "DEPOSIT" ? ArrowDownToLine : ArrowUpFromLine;

              return (
                <tr key={transaction.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-secondary">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.type}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {transaction.reference ?? transaction.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium">{transaction.client.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{transaction.client.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium">{formatMoney(transaction.amount, transaction.currency)}</div>
                    <div className="text-xs text-muted-foreground">
                      Net {formatMoney(transaction.netAmount, transaction.currency)}
                    </div>
                  </td>
                  <td className="px-5 py-4">{formatMoney(transaction.feeAmount, transaction.currency)}</td>
                  <td className="px-5 py-4">
                    <FinanceStatusBadge value={transaction.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-mono text-xs">{transaction.riskScore}/100</div>
                    {transaction.suspicious ? (
                      <div className="mt-1 text-xs text-trading-red">{transaction.riskReason}</div>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {transaction.gatewayConnection?.displayName ?? transaction.method ?? "Manual"}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDateTime(transaction.requestedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
