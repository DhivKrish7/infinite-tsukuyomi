"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsMetrics, RetentionSegment } from "../types";
import { formatPercent } from "../format";

const colors = ["#00e5a0", "#fbbf24", "#ff4d6d"];

export function RetentionAnalyticsPanel({
  data,
  metrics
}: {
  data: RetentionSegment[];
  metrics: AnalyticsMetrics;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Retention Analytics</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Retention {formatPercent(metrics.retentionRate)} / churn risk {metrics.churnRisk}
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="clients" nameKey="segment" innerRadius={48} outerRadius={78} paddingAngle={3}>
                {data.map((entry, index) => (
                  <Cell key={entry.segment} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0d1219",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#e8edf2"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((segment, index) => (
            <div key={segment.segment} className="flex items-center justify-between rounded-lg border border-white/10 bg-secondary/60 p-3">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="font-medium">{segment.segment}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{segment.clients} clients</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
