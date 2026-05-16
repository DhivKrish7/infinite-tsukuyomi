import { Activity, BadgeDollarSign, CircleDollarSign, LineChart, Repeat2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsMetrics } from "../types";
import { formatMoney, formatPercent } from "../format";

export function AnalyticsKpiGrid({ metrics }: { metrics: AnalyticsMetrics }) {
  const items = [
    { label: "AUM", value: formatMoney(metrics.aum, true), icon: CircleDollarSign, tone: "text-trading-green" },
    { label: "30D Volume", value: formatMoney(metrics.tradingVolume, true), icon: LineChart, tone: "text-primary" },
    { label: "Revenue", value: formatMoney(metrics.revenue, true), icon: BadgeDollarSign, tone: "text-trading-purple" },
    { label: "Net Flow", value: formatMoney(metrics.netFlow, true), icon: TrendingUp, tone: "text-trading-green" },
    { label: "Retention", value: formatPercent(metrics.retentionRate), icon: Repeat2, tone: "text-trading-amber" },
    { label: "Conversion", value: formatPercent(metrics.conversionRate), icon: Activity, tone: "text-primary" }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
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
