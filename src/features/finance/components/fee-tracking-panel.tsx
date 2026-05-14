import { ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceFee } from "../types";
import { formatDateTime, formatMoney } from "../format";
import { FinanceStatusBadge } from "./finance-status-badge";

export function FeeTrackingPanel({ fees }: { fees: FinanceFee[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fees.map((fee) => (
          <div key={fee.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-secondary/60 p-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
                <ReceiptText className="h-4 w-4 text-trading-purple" />
              </div>
              <div>
                <div className="font-medium">{fee.name}</div>
                <div className="text-xs text-muted-foreground">
                  {fee.transaction?.client?.name ?? "Treasury"} / {formatDateTime(fee.createdAt)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatMoney(fee.amount, fee.currency)}</div>
              <div className="mt-1">
                <FinanceStatusBadge value={fee.type} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
