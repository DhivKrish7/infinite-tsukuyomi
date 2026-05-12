"use client";

import { AppShell } from "@/components/layout/app-shell";
import { activities, clients, platforms } from "./data";
import { ActivityFeed } from "./components/activity-feed";
import { ClientsTable } from "./components/clients-table";
import { PlatformBanner } from "./components/platform-banner";
import { PlatformSplit } from "./components/platform-split";
import { StatsGrid } from "./components/stats-grid";
import { VolumeChart } from "./components/volume-chart";
import { useDashboardStore } from "@/stores/dashboard-store";

export function DashboardPage() {
  const activePlatform = useDashboardStore((state) => state.activePlatform);
  const visiblePlatforms = platforms.filter((platform) => platform.connected);
  const filteredClients =
    activePlatform === "all" ? clients : clients.filter((client) => client.platformId === activePlatform);
  const filteredActivities =
    activePlatform === "all"
      ? activities
      : activities.filter((activity) => activity.platformId === activePlatform);

  return (
    <AppShell>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <PlatformBanner platforms={visiblePlatforms} />
        <StatsGrid clients={filteredClients} platforms={visiblePlatforms} />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <VolumeChart />
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
