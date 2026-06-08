"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, CircleDollarSign, RefreshCw, Sigma, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchExposureOverview } from "../api";
import type { ExposureBucket, ExposureOverview } from "../types";

const demoExposure: ExposureOverview = {
  summary: {
    accounts: 4,
    openTrades: 6,
    netExposure: 184250,
    grossExposure: 642900,
    longExposure: 413575,
    shortExposure: 229325,
    openPnl: 3280
  },
  symbolExposure: [
    { key: "EURUSD", net: 121500, gross: 220000, long: 170750, short: 49250, pnl: 1450, openTrades: 3 },
    { key: "XAUUSD", net: -68250, gross: 188250, long: 60000, short: 128250, pnl: -620, openTrades: 2 }
  ],
  currencyExposure: [
    { key: "USD", net: 184250, gross: 642900, long: 413575, short: 229325, pnl: 3280, openTrades: 6, accountEquity: 912400, accountBalance: 905000, accountMargin: 78000 }
  ],
  openTrades: []
};

export function ExposurePage() {
  const query = useQuery({
    queryKey: ["exposure", "overview"],
    queryFn: fetchExposureOverview,
    retry: false
  });
  const data = query.data ?? demoExposure;

  return (
    <AppShell>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Exposure</h1>
          <p className="mt-1 text-sm text-muted-foreground">Read-only exposure from existing trading accounts and trades.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            No broker changes / no execution changes
          </div>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {query.isError ? (
          <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
            Showing demo exposure until trading data is available.
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Metric icon={Sigma} label="Net Exposure" value={money(data.summary.netExposure)} />
          <Metric icon={CircleDollarSign} label="Gross Exposure" value={money(data.summary.grossExposure)} />
          <Metric icon={TrendingUp} label="Long" value={money(data.summary.longExposure)} />
          <Metric icon={TrendingDown} label="Short" value={money(data.summary.shortExposure)} />
          <Metric icon={Activity} label="Open PnL" value={money(data.summary.openPnl)} />
          <Metric icon={Activity} label="Open Trades" value={String(data.summary.openTrades)} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <ExposureTable title="Symbol Exposure" rows={data.symbolExposure} columns={["Symbol", "Net", "Gross", "Long", "Short", "PnL", "Open"]} />
          <ExposureTable title="Currency Exposure" rows={data.currencyExposure} columns={["Currency", "Net", "Gross", "Equity", "Balance", "Margin", "Open"]} currency />
        </section>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Open Trade Exposure</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Ticket</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 font-medium">Symbol</th>
                  <th className="px-5 py-3 font-medium">Side</th>
                  <th className="px-5 py-3 font-medium">Volume</th>
                  <th className="px-5 py-3 font-medium">Open Price</th>
                  <th className="px-5 py-3 font-medium">PnL</th>
                </tr>
              </thead>
              <tbody>
                {data.openTrades.length ? (
                  data.openTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-mono text-xs">{trade.ticket}</td>
                      <td className="px-5 py-4">{trade.account.client.name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{trade.account.login}</td>
                      <td className="px-5 py-4 font-medium">{trade.symbol}</td>
                      <td className="px-5 py-4 text-muted-foreground">{trade.side}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{trade.volume.toFixed(2)}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{trade.openPrice.toFixed(5)}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{money(trade.pnl)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-5 text-sm text-muted-foreground" colSpan={8}>No open trades</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Sigma; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExposureTable({
  title,
  rows,
  columns,
  currency = false
}: {
  title: string;
  rows: ExposureBucket[];
  columns: string[];
  currency?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {columns.map((column) => (
                <th key={column} className="px-5 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                <td className="px-5 py-4 font-medium">{row.key}</td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{money(row.net)}</td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{money(row.gross)}</td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{money(currency ? row.accountEquity ?? 0 : row.long)}</td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{money(currency ? row.accountBalance ?? 0 : row.short)}</td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{money(currency ? row.accountMargin ?? 0 : row.pnl)}</td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.openTrades}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
