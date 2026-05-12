"use client";

import { RadioTower } from "lucide-react";
import type { Platform } from "../types";
import { useDashboardStore } from "@/stores/dashboard-store";
import { cn } from "@/lib/utils";

export function PlatformBanner({ platforms }: { platforms: Platform[] }) {
  const { activePlatform, setActivePlatform } = useDashboardStore();

  return (
    <section className="trading-surface flex flex-wrap items-center gap-3 rounded-xl p-4">
      <span className="text-xs text-muted-foreground">Platform scope</span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActivePlatform("all")}
          className={cn(
            "rounded-md border border-white/10 px-3 py-2 text-xs font-medium transition",
            activePlatform === "all" && "border-primary/30 bg-primary/10 text-primary"
          )}
        >
          All Platforms
        </button>
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setActivePlatform(platform.id)}
            className={cn(
              "flex items-center gap-2 rounded-md border border-white/10 bg-secondary px-3 py-2 text-xs font-medium transition hover:border-white/20",
              activePlatform === platform.id && "border-transparent"
            )}
            style={
              activePlatform === platform.id
                ? { backgroundColor: `${platform.color}22`, color: platform.color }
                : undefined
            }
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: platform.color }} />
            {platform.name}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 rounded-full border border-trading-green/20 bg-trading-green/10 px-3 py-1.5 text-xs font-medium text-trading-green">
        <RadioTower className="h-3.5 w-3.5" />
        {platforms.length} live feeds
      </div>
    </section>
  );
}
