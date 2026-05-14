import { AlertTriangle, FileWarning, Scale, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ComplianceMetricSet } from "../types";

export function ComplianceKpiGrid({ metrics }: { metrics: ComplianceMetricSet }) {
  const items = [
    { label: "Pending Reviews", value: metrics.pendingReviews, icon: ShieldCheck, tone: "text-trading-amber" },
    { label: "High Risk Cases", value: metrics.highRiskCases, icon: AlertTriangle, tone: "text-trading-red" },
    { label: "Resubmissions", value: metrics.resubmissions, icon: FileWarning, tone: "text-primary" },
    { label: "Sanctions Matches", value: metrics.sanctionsMatches, icon: Scale, tone: "text-trading-purple" }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
