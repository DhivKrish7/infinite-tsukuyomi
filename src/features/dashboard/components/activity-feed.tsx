"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BadgeCheck, CircleDollarSign, RefreshCcw, UserPlus, WalletCards } from "lucide-react";
import type { ActivityEvent, Platform } from "../types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const icons = {
  deposit: CircleDollarSign,
  lead: UserPlus,
  withdrawal: WalletCards,
  kyc: BadgeCheck,
  risk: AlertTriangle,
  sync: RefreshCcw
};

export function ActivityFeed({
  activities,
  platforms
}: {
  activities: ActivityEvent[];
  platforms: Platform[];
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Live Activity</CardTitle>
        <div className="flex items-center gap-2 rounded-full border border-trading-green/20 bg-trading-green/10 px-3 py-1 text-xs text-trading-green">
          <span className="h-2 w-2 animate-pulse rounded-full bg-trading-green" />
          Live
        </div>
      </CardHeader>
      <div>
        {activities.map((activity, index) => {
          const Icon = icons[activity.type];
          const platform = platforms.find((item) => item.id === activity.platformId);

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex gap-3 border-b border-white/10 px-5 py-4 last:border-b-0"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${platform?.color ?? "#00d4ff"}18`,
                  color: platform?.color ?? "#00d4ff"
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm leading-5">{activity.message}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <span>{activity.time}</span>
                  <span>·</span>
                  <span>{platform?.name ?? "Unknown"}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
