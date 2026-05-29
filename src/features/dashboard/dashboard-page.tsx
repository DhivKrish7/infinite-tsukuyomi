"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { activities, clients, platforms, volumeData } from "./data";
import { ActivityFeed } from "./components/activity-feed";
import { ClientsTable } from "./components/clients-table";
import { LivePriceStrip } from "./components/live-price-strip";
import { PlatformBanner } from "./components/platform-banner";
import { PlatformSplit } from "./components/platform-split";
import { StatsGrid } from "./components/stats-grid";
import { VolumeChart } from "./components/volume-chart";
import { useDashboardStore } from "@/stores/dashboard-store";
import type { ActivityEvent, Client, DashboardRealtimeEvent, LivePrice, Platform, VolumePoint } from "./types";

export function DashboardPage() {
  const activePlatform = useDashboardStore((state) => state.activePlatform);
  const [livePlatforms, setLivePlatforms] = useState<Platform[]>(platforms);
  const [liveClients, setLiveClients] = useState<Client[]>(clients);
  const [liveActivities, setLiveActivities] = useState<ActivityEvent[]>(activities);
  const [liveVolumeData, setLiveVolumeData] = useState<VolumePoint[]>(volumeData);
  const [livePrices, setLivePrices] = useState<LivePrice[]>([]);
  const [openPositions, setOpenPositions] = useState(3291);
  const visiblePlatforms = livePlatforms.filter((platform) => platform.connected);
  const filteredClients =
    activePlatform === "all" ? liveClients : liveClients.filter((client) => client.platformId === activePlatform);
  const filteredActivities =
    activePlatform === "all"
      ? liveActivities
      : liveActivities.filter((activity) => activity.platformId === activePlatform);

  useEffect(() => {
    const stream = new EventSource("/api/realtime/stream");

    stream.onmessage = (message) => {
      const event = JSON.parse(message.data) as DashboardRealtimeEvent;
      if (event.type === "heartbeat") return;

      applyRealtimeEvent({
        event,
        setLiveActivities,
        setLiveClients,
        setLivePlatforms,
        setLivePrices,
        setLiveVolumeData,
        setOpenPositions
      });
    };

    return () => stream.close();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <PlatformBanner platforms={visiblePlatforms} />
        <StatsGrid clients={filteredClients} platforms={visiblePlatforms} openPositions={openPositions} />
        <LivePriceStrip prices={livePrices} />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <VolumeChart data={liveVolumeData} />
          <PlatformSplit platforms={visiblePlatforms} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <ClientsTable clients={filteredClients} platforms={platforms} />
          <ActivityFeed activities={filteredActivities} platforms={platforms} />
        </section>
      </div>
    </AppShell>
  );
}

function applyRealtimeEvent({
  event,
  setLiveActivities,
  setLiveClients,
  setLivePlatforms,
  setLivePrices,
  setLiveVolumeData,
  setOpenPositions
}: {
  event: DashboardRealtimeEvent;
  setLiveActivities: Dispatch<SetStateAction<ActivityEvent[]>>;
  setLiveClients: Dispatch<SetStateAction<Client[]>>;
  setLivePlatforms: Dispatch<SetStateAction<Platform[]>>;
  setLivePrices: Dispatch<SetStateAction<LivePrice[]>>;
  setLiveVolumeData: Dispatch<SetStateAction<VolumePoint[]>>;
  setOpenPositions: Dispatch<SetStateAction<number>>;
}) {
  const platformId = event.platformId ?? platformFromBroker(event.broker);

  if (event.type === "price.tick" && event.symbol && event.bid && event.ask && event.spread) {
    const key = `${event.broker ?? "Broker"}-${event.symbol}`;
    const symbol = event.symbol;
    const bid = event.bid;
    const ask = event.ask;
    const spread = event.spread;

    setLivePrices((current) =>
      [
        {
          key,
          broker: event.broker ?? "Broker",
          platformId,
          symbol,
          bid,
          ask,
          spread,
          timestamp: event.timestamp ?? new Date().toISOString()
        },
        ...current.filter((price) => price.key !== key)
      ].slice(0, 8)
    );
    bumpChart(setLiveVolumeData, 0.02, 0);
    return;
  }

  if (event.type === "deposit.created" || event.type === "withdrawal.created") {
    const signedAmount = event.type === "deposit.created" ? event.amount ?? 0 : -(event.amount ?? 0);
    setLiveClients((current) => upsertClientMoney(current, event, signedAmount, 0));
    setLivePlatforms((current) => updatePlatformMoney(current, platformId, "aum", signedAmount));
    appendActivity(setLiveActivities, event, event.type === "deposit.created" ? "deposit" : "withdrawal", platformId);
    return;
  }

  if (event.type === "trade.opened" || event.type === "trade.closed") {
    const pnl = Number(event.pnl ?? 0);
    if (event.type === "trade.opened") setOpenPositions((current) => current + 1);
    if (event.type === "trade.closed") setOpenPositions((current) => Math.max(0, current - 1));
    setLiveClients((current) => upsertClientMoney(current, event, 0, pnl));
    setLivePlatforms((current) => updatePlatformMoney(current, platformId, "volume", event.notional ?? 0));
    bumpChart(setLiveVolumeData, (event.notional ?? 0) / 1_000_000, pnl / 1000);
    appendActivity(setLiveActivities, event, "trade", platformId);
    return;
  }

  if (event.type === "client.presence") {
    setLiveClients((current) => upsertClientPresence(current, event));
    appendActivity(setLiveActivities, event, "client", platformId);
    return;
  }

  if (event.type === "kyc.submitted") {
    setLiveClients((current) => upsertClientKyc(current, event));
    appendActivity(setLiveActivities, event, "kyc", platformId);
    return;
  }

  if (event.type === "notification.created") {
    appendActivity(setLiveActivities, event, "notification", platformId);
  }
}

function appendActivity(
  setLiveActivities: Dispatch<SetStateAction<ActivityEvent[]>>,
  event: DashboardRealtimeEvent,
  type: ActivityEvent["type"],
  platformId: string
) {
  setLiveActivities((current) =>
    [
      {
        id: event.id ?? `${event.type}-${Date.now()}`,
        type,
        message: activityMessage(event),
        time: "Just now",
        platformId
      },
      ...current
    ].slice(0, 12)
  );
}

function upsertClientMoney(clientsList: Client[], event: DashboardRealtimeEvent, balanceDelta: number, pnlDelta: number) {
  return upsertClient(clientsList, event, (client) => {
    const nextBalance = Math.max(0, parseMoney(client.balance) + balanceDelta);
    const nextPnl = parseMoney(client.pnl) + pnlDelta;
    return {
      ...client,
      balance: formatMoney(nextBalance),
      pnl: formatSignedMoney(nextPnl),
      pnlDirection: nextPnl >= 0 ? "positive" : "negative"
    };
  });
}

function upsertClientPresence(clientsList: Client[], event: DashboardRealtimeEvent) {
  return upsertClient(clientsList, event, (client) => ({
    ...client,
    presence: event.status ?? client.presence ?? "offline"
  }));
}

function upsertClientKyc(clientsList: Client[], event: DashboardRealtimeEvent) {
  return upsertClient(clientsList, event, (client) => ({
    ...client,
    kyc: "pending"
  }));
}

function upsertClient(
  clientsList: Client[],
  event: DashboardRealtimeEvent,
  update: (client: Client) => Client
) {
  const clientId = event.clientId;
  if (!clientId) return clientsList;

  const existing = clientsList.find((client) => client.id === clientId);
  if (existing) {
    return clientsList.map((client) => (client.id === clientId ? update(client) : client));
  }

  return [
    update({
      id: clientId,
      name: event.clientName ?? "Sandbox Client",
      email: `${clientId.toLowerCase()}@nexusdemo.local`,
      platformId: event.platformId ?? platformFromBroker(event.broker),
      balance: "$0",
      pnl: "$0",
      pnlDirection: "positive",
      presence: "online",
      status: "active",
      kyc: "pending",
      risk: "medium"
    }),
    ...clientsList
  ];
}

function updatePlatformMoney(platformsList: Platform[], platformId: string, field: "aum" | "volume", delta: number) {
  return platformsList.map((platform) =>
    platform.id === platformId
      ? {
          ...platform,
          [field]: formatCompactMoney(Math.max(0, parseMoney(platform[field]) + delta))
        }
      : platform
  );
}

function bumpChart(
  setLiveVolumeData: Dispatch<SetStateAction<VolumePoint[]>>,
  volumeDelta: number,
  pnlDelta: number
) {
  setLiveVolumeData((current) =>
    current.map((point, index) =>
      index === current.length - 1
        ? {
            ...point,
            volume: Math.round((point.volume + volumeDelta) * 10) / 10,
            pnl: Math.round((point.pnl + pnlDelta) * 10) / 10
          }
        : point
    )
  );
}

function activityMessage(event: DashboardRealtimeEvent) {
  if (event.message) return event.message;
  if (event.type === "trade.opened") return `${event.clientName ?? "Client"} opened ${event.symbol} ${event.volume} lots`;
  if (event.type === "trade.closed") return `${event.clientName ?? "Client"} closed ${event.symbol} with ${event.pnl} PnL`;
  if (event.type === "notification.created") return event.title ?? "Notification received";
  return event.type;
}

function platformFromBroker(broker?: string) {
  return broker === "SquidMarkets" ? "squidfx" : "nebulafx";
}

function parseMoney(value: string) {
  const sign = value.trim().startsWith("-") ? -1 : 1;
  const multiplier = value.includes("M") ? 1_000_000 : value.includes("K") ? 1_000 : 1;
  return sign * (Number(value.replace(/[-+$,MK]/g, "")) * multiplier || 0);
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatSignedMoney(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}$${Math.abs(Math.round(value)).toLocaleString()}`;
}

function formatCompactMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}
