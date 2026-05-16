import { RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRealtime } from "../types";
import { formatDateTime } from "../format";

export function RealtimeStatsPanel({ realtime }: { realtime: AnalyticsRealtime }) {
  const stats = [
    { label: "Active Clients", value: realtime.activeClients },
    { label: "Open Accounts", value: realtime.openAccounts },
    { label: "Connected Brokers", value: realtime.connectedBrokers },
    { label: "Pending Withdrawals", value: realtime.pendingWithdrawals }
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Realtime Stats</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Auto-refreshing operational counters</p>
        </div>
        <Badge variant="success">
          <RadioTower className="mr-1 h-3 w-3" />
          Live
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/10 bg-secondary/60 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              <div className="mt-2 font-display text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">Last update {formatDateTime(realtime.lastUpdatedAt)}</div>
      </CardContent>
    </Card>
  );
}
