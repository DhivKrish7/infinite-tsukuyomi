"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Cable,
  CircleOff,
  PlugZap,
  Power,
  RadioTower,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Signal,
  Zap
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchBrokerIntegrations,
  runBrokerAction,
  syncBrokerConnection,
  testBrokerConnection
} from "../api";
import { demoBrokerIntegrations } from "../demo-data";
import type { BrokerConnectionSummary, BrokerRealtimeEvent } from "../types";

const statusVariant = {
  CONNECTED: "success",
  CONNECTING: "warning",
  DEGRADED: "warning",
  ERROR: "danger",
  SUSPENDED: "muted",
  DISCONNECTED: "muted"
} as const;

export function BrokerIntegrationsPage() {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<BrokerRealtimeEvent[]>([]);
  const [lastHealth, setLastHealth] = useState<Record<string, string>>({});
  const query = useQuery({
    queryKey: ["integrations", "brokers"],
    queryFn: fetchBrokerIntegrations,
    retry: false
  });
  const data = query.data ?? demoBrokerIntegrations;
  const connectedCount = data.connections.filter((connection) => connection.status === "CONNECTED").length;
  const outageCount = data.connections.filter((connection) => Boolean(connection.settings?.simulateOutage)).length;

  const actionMutation = useMutation({
    mutationFn: ({ connectionId, action }: { connectionId: string; action: Parameters<typeof runBrokerAction>[1] }) =>
      runBrokerAction(connectionId, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["integrations", "brokers"] })
  });

  const healthMutation = useMutation({
    mutationFn: testBrokerConnection,
    onSuccess: (result, connectionId) => {
      setLastHealth((current) => ({
        ...current,
        [connectionId]: result.health?.message ?? "Health check completed"
      }));
      queryClient.invalidateQueries({ queryKey: ["integrations", "brokers"] });
    }
  });

  const syncMutation = useMutation({
    mutationFn: syncBrokerConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["integrations", "brokers"] })
  });

  useEffect(() => {
    const stream = new EventSource("/api/integrations/brokers/stream");

    stream.onmessage = (message) => {
      const event = JSON.parse(message.data) as BrokerRealtimeEvent;
      if (event.type === "heartbeat") return;
      setEvents((current) => [event, ...current].slice(0, 12));
    };

    stream.onerror = () => {
      stream.close();
    };

    return () => stream.close();
  }, []);

  const latestPriceTicks = useMemo(
    () => events.filter((event) => event.type === "price.tick").slice(0, 5),
    [events]
  );

  return (
    <AppShell>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Broker Sandbox Control</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Local mock broker APIs, simulated websocket activity, sync controls, outages, and full demo workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">{connectedCount} connected</Badge>
            <Badge variant={outageCount ? "danger" : "muted"}>{outageCount} outages</Badge>
            <Badge variant="purple">Local only</Badge>
          </div>
        </div>

        {query.isError ? (
          <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
            Showing built-in sandbox data until PostgreSQL is configured and seeded.
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={PlugZap} label="Mock adapters" value={String(data.adapters.length)} detail="NebulaFX + SquidMarkets" />
          <MetricCard icon={Signal} label="Connections" value={String(data.connections.length)} detail="Local broker bridges" />
          <MetricCard icon={RefreshCw} label="Sync engines" value="4" detail="Accounts, balances, trades, cashier" />
          <MetricCard icon={RadioTower} label="Realtime feed" value={events.length ? "Live" : "Waiting"} detail="Mock websocket stream" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Broker Management</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["integrations", "brokers"] })}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              {data.connections.map((connection) => (
                <BrokerConnectionPanel
                  key={connection.id}
                  connection={connection}
                  busy={
                    actionMutation.isPending || healthMutation.isPending || syncMutation.isPending
                  }
                  lastHealth={lastHealth[connection.id]}
                  onAction={(action) => actionMutation.mutate({ connectionId: connection.id, action })}
                  onHealth={() => healthMutation.mutate(connection.id)}
                  onSync={() => syncMutation.mutate(connection.id)}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Realtime Sandbox Feed</CardTitle>
              <Badge variant={events.length ? "success" : "muted"}>{events.length ? "Streaming" : "Connecting"}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                {latestPriceTicks.length ? (
                  latestPriceTicks.map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="rounded-md border border-white/10 bg-secondary/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-mono text-xs text-primary">{event.symbol}</div>
                        <div className="text-[11px] text-muted-foreground">{event.broker}</div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <Value label="Bid" value={event.bid ?? "-"} />
                        <Value label="Ask" value={event.ask ?? "-"} />
                        <Value label="Spread" value={event.spread ?? "-"} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-white/10 bg-secondary/60 p-4 text-sm text-muted-foreground">
                    Waiting for mock price ticks...
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {events.slice(0, 6).map((event, index) => (
                  <EventRow key={`${event.timestamp}-${event.type}-${index}`} event={event} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Registered Adapter Plugins</CardTitle>
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
      </div>
    </AppShell>
  );
}

function BrokerConnectionPanel({
  connection,
  busy,
  lastHealth,
  onAction,
  onHealth,
  onSync
}: {
  connection: BrokerConnectionSummary;
  busy: boolean;
  lastHealth?: string;
  onAction: (action: Parameters<typeof runBrokerAction>[1]) => void;
  onHealth: () => void;
  onSync: () => void;
}) {
  const outageActive = Boolean(connection.settings?.simulateOutage);
  const disabled = connection.status === "SUSPENDED" || !connection.platform.isConnected;

  return (
    <div className="rounded-lg border border-white/10 bg-secondary/60 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium">{connection.displayName}</div>
            <Badge variant={statusVariant[connection.status as keyof typeof statusVariant] ?? "muted"}>
              {connection.status}
            </Badge>
            {outageActive ? <Badge variant="danger">Outage active</Badge> : null}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {connection.platform.name} · {connection.platform.type} · {connection.adapterKey}
          </div>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <Value label="Account sync" value={formatDate(connection.lastAccountSyncAt)} />
            <Value label="Trade sync" value={formatDate(connection.lastTradeSyncAt)} />
            <Value label="Cashier sync" value={formatDate(connection.lastTransactionSyncAt)} />
          </div>
          {lastHealth ? <div className="mt-3 text-xs text-primary">{lastHealth}</div> : null}
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Button variant="outline" size="sm" disabled={busy} onClick={onHealth}>
            <Zap className="h-4 w-4" />
            Test
          </Button>
          <Button variant="outline" size="sm" disabled={busy || disabled} onClick={onSync}>
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onAction("reconnect")}>
            <RotateCcw className="h-4 w-4" />
            Reconnect
          </Button>
          <Button
            variant={outageActive ? "outline" : "destructive"}
            size="sm"
            disabled={busy || disabled}
            onClick={() => onAction(outageActive ? "clear_outage" : "simulate_outage")}
          >
            <ShieldAlert className="h-4 w-4" />
            {outageActive ? "Clear outage" : "Outage"}
          </Button>
          <Button
            variant={disabled ? "default" : "outline"}
            size="sm"
            disabled={busy}
            onClick={() => onAction(disabled ? "enable" : "disable")}
          >
            {disabled ? <Power className="h-4 w-4" /> : <CircleOff className="h-4 w-4" />}
            {disabled ? "Enable" : "Disable"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="truncate font-mono text-[10px] text-muted-foreground">{detail}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Value({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="truncate text-xs font-medium text-foreground">{value}</div>
    </div>
  );
}

function EventRow({ event }: { event: BrokerRealtimeEvent }) {
  const label =
    event.type === "price.tick"
      ? `${event.broker} ${event.symbol} ${event.bid}/${event.ask}`
      : event.type?.startsWith("trade.")
        ? `${event.broker} ${event.type.replace(".", " ")} ${event.symbol} ${event.volume} lots`
        : event.message ?? event.title ?? event.type;

  return (
    <div className="flex gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
      <Cable className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="truncate text-sm">{label}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{formatDate(event.timestamp)}</div>
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}
