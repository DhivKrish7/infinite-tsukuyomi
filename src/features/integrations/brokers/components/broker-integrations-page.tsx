"use client";

import { useQuery } from "@tanstack/react-query";
import { Cable, RadioTower, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBrokerIntegrations } from "../api";
import { demoBrokerIntegrations } from "../demo-data";

export function BrokerIntegrationsPage() {
  const query = useQuery({
    queryKey: ["integrations", "brokers"],
    queryFn: fetchBrokerIntegrations,
    retry: false
  });
  const data = query.data ?? demoBrokerIntegrations;

  return (
    <AppShell>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Trading Platform Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Broker adapter registry, connector health, realtime balance streams, and sync engines.
          </p>
        </div>

        {query.isError ? (
          <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
            Showing demo integration data until PostgreSQL is configured and migrated.
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Registered Broker Adapters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {data.adapters.map((adapter) => (
                <div key={adapter.key} className="rounded-lg border border-white/10 bg-secondary/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{adapter.displayName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{adapter.key}</div>
                    </div>
                    <Badge variant="purple">{adapter.version}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {adapter.capabilities.map((capability) => (
                      <Badge key={capability} variant="muted">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Realtime Layer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <RadioTower className="mt-0.5 h-5 w-5 text-trading-green" />
                <p>Adapters publish normalized balance events into a typed broker event bus.</p>
              </div>
              <div className="flex gap-3">
                <Cable className="mt-0.5 h-5 w-5 text-primary" />
                <p>The websocket gateway fans events out to authenticated tenant-scoped clients.</p>
              </div>
              <div className="flex gap-3">
                <RefreshCw className="mt-0.5 h-5 w-5 text-trading-purple" />
                <p>Sync engines persist balance snapshots, cursors, and operational sync-run history.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Connections</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Connection</th>
                  <th className="px-5 py-3 font-medium">Adapter</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Account Sync</th>
                  <th className="px-5 py-3 font-medium">Trade Sync</th>
                  <th className="px-5 py-3 font-medium">Transaction Sync</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.connections.map((connection) => (
                  <tr key={connection.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="font-medium">{connection.displayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {connection.platform.name} · {connection.platform.type}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">{connection.adapterKey}</td>
                    <td className="px-5 py-4">
                      <Badge variant={connection.status === "CONNECTED" ? "success" : "warning"}>
                        {connection.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(connection.lastAccountSyncAt)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(connection.lastTradeSyncAt)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(connection.lastTransactionSyncAt)}</td>
                    <td className="px-5 py-4">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                        Sync
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}
