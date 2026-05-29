import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CircleDollarSign, Users, Wallet } from "lucide-react";
import type { Client, Platform } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statDefinitions = [
  {
    label: "Total Clients",
    value: "847",
    delta: "8.2%",
    direction: "up",
    icon: Users,
    color: "text-primary"
  },
  {
    label: "Total AUM",
    value: "$24.7M",
    delta: "12.4%",
    direction: "up",
    icon: Wallet,
    color: "text-trading-green"
  },
  {
    label: "Open Positions",
    value: "3,291",
    delta: "2.1%",
    direction: "down",
    icon: BriefcaseBusiness,
    color: "text-trading-red"
  },
  {
    label: "Today's Volume",
    value: "$6.1M",
    delta: "31.5%",
    direction: "up",
    icon: CircleDollarSign,
    color: "text-trading-purple"
  }
];

export function StatsGrid({
  clients,
  platforms,
  openPositions
}: {
  clients: Client[];
  platforms: Platform[];
  openPositions?: number;
}) {
  const scopedStats = statDefinitions.map((stat) => {
    if (stat.label === "Total Clients") {
      return { ...stat, value: String(clients.length || platforms.reduce((sum, p) => sum + p.clients, 0)) };
    }

    if (stat.label === "Total AUM") {
      return { ...stat, value: formatCompactMoney(platforms.reduce((sum, platform) => sum + parseMoney(platform.aum), 0)) };
    }

    if (stat.label === "Open Positions" && typeof openPositions === "number") {
      return { ...stat, value: openPositions.toLocaleString() };
    }

    if (stat.label === "Today's Volume") {
      return { ...stat, value: formatCompactMoney(platforms.reduce((sum, platform) => sum + parseMoney(platform.volume), 0)) };
    }

    return stat;
  });

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {scopedStats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="relative p-5">
            <div className={cn("absolute inset-x-0 top-0 h-0.5 bg-current", stat.color)} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </div>
                <div className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {stat.value}
                </div>
                <div
                  className={cn(
                    "mt-2 flex items-center gap-1 text-xs font-medium",
                    stat.direction === "up" ? "text-trading-green" : "text-trading-red"
                  )}
                >
                  {stat.direction === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {stat.delta} vs previous period
                </div>
              </div>
              <div className={cn("rounded-lg bg-white/5 p-2", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function parseMoney(value: string) {
  const multiplier = value.includes("M") ? 1_000_000 : value.includes("K") ? 1_000 : 1;
  return Number(value.replace(/[$,MK]/g, "")) * multiplier || 0;
}

function formatCompactMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}
