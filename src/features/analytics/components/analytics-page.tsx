"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAnalyticsOverview } from "../api";
import { demoAnalyticsOverview } from "../demo-data";
import { AnalyticsKpiGrid } from "./analytics-kpi-grid";
import { AnalyticsPageShell } from "./analytics-page-shell";
import { AumMetricsChart } from "./aum-metrics-chart";
import { BrokerPerformanceTable } from "./broker-performance-table";
import { ConversionFunnelPanel } from "./conversion-funnel-panel";
import { RealtimeStatsPanel } from "./realtime-stats-panel";
import { RetentionAnalyticsPanel } from "./retention-analytics-panel";
import { RevenueAnalyticsChart } from "./revenue-analytics-chart";
import { TradingActivityChart } from "./trading-activity-chart";

export function AnalyticsPage() {
  const query = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: fetchAnalyticsOverview,
    retry: false,
    refetchInterval: 15_000
  });
  const data = query.data ?? demoAnalyticsOverview;

  return (
    <AnalyticsPageShell
      title="Analytics"
      subtitle="Realtime stats, AUM, trading activity, revenue, retention, funnel, and broker performance."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">30 day operating view</div>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo analytics until PostgreSQL is configured and migrated.
        </div>
      ) : null}

      <RealtimeStatsPanel realtime={data.realtime} />
      <AnalyticsKpiGrid metrics={data.metrics} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AumMetricsChart data={data.aumSeries} metrics={data.metrics} />
        <TradingActivityChart data={data.tradingActivity} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <RevenueAnalyticsChart data={data.revenueSeries} />
        <RetentionAnalyticsPanel data={data.retention} metrics={data.metrics} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
        <ConversionFunnelPanel data={data.conversionFunnel} />
        <BrokerPerformanceTable brokers={data.brokerPerformance} />
      </section>
    </AnalyticsPageShell>
  );
}
