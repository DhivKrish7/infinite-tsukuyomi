import { AlertTriangle, BadgeCheck, CircleDollarSign, ReceiptText, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FinanceMetricSet } from "../types";
import { formatMoney } from "../format";

export function FinanceKpiGrid({ metrics }: { metrics: FinanceMetricSet }) {
  const items = [
    {
      label: "30D Deposits",
      value: formatMoney(metrics.deposits30d),
      icon: CircleDollarSign,
      tone: "text-trading-green"
    },
    {
      label: "30D Withdrawals",
      value: formatMoney(metrics.withdrawals30d),
      icon: WalletCards,
      tone: "text-primary"
    },
    {
      label: "Fees Captured",
      value: formatMoney(metrics.fees30d),
      icon: ReceiptText,
      tone: "text-trading-purple"
    },
    {
      label: "Approvals",
      value: String(metrics.pendingApprovals),
      icon: BadgeCheck,
      tone: "text-trading-amber"
    },
    {
      label: "Open Flags",
      value: String(metrics.openFlags),
      icon: AlertTriangle,
      tone: "text-trading-red"
    }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</div>
              <div className="mt-2 font-display text-xl font-bold">{item.value}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5">
              <item.icon className={`h-5 w-5 ${item.tone}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
