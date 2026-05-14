import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SuspiciousFlag } from "../types";
import { formatDateTime, formatMoney } from "../format";
import { FinanceStatusBadge } from "./finance-status-badge";

export function SuspiciousFlagsPanel({ flags }: { flags: SuspiciousFlag[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suspicious Transaction Flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flags.map((flag) => (
          <div key={flag.id} className="rounded-lg border border-trading-red/20 bg-trading-red/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-trading-red/20 bg-trading-red/10">
                  <AlertTriangle className="h-4 w-4 text-trading-red" />
                </div>
                <div>
                  <div className="font-medium">{flag.transaction?.client.name ?? flag.ruleCode}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {flag.ruleCode} / {formatDateTime(flag.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <FinanceStatusBadge value={flag.severity} />
                <FinanceStatusBadge value={flag.status} />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{flag.reason}</p>
            {flag.transaction ? (
              <div className="mt-3 text-sm font-medium">
                {flag.transaction.type} {formatMoney(flag.transaction.amount, flag.transaction.currency)}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
