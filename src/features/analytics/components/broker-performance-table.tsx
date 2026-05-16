import { PlugZap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { BrokerPerformance } from "../types";
import { formatDateTime } from "../format";

export function BrokerPerformanceTable({ brokers }: { brokers: BrokerPerformance[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Broker Performance</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Broker</th>
              <th className="px-5 py-3 font-medium">Clients</th>
              <th className="px-5 py-3 font-medium">Accounts</th>
              <th className="px-5 py-3 font-medium">Connections</th>
              <th className="px-5 py-3 font-medium">Health</th>
              <th className="px-5 py-3 font-medium">Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {brokers.map((broker) => (
              <tr key={broker.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-secondary">
                      <PlugZap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{broker.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{broker.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{broker.clients}</td>
                <td className="px-5 py-4">{broker.accounts}</td>
                <td className="px-5 py-4">
                  {broker.connected}/{broker.connections}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={broker.healthScore >= 90 ? "success" : broker.healthScore >= 60 ? "warning" : "danger"}>
                    {broker.healthScore}%
                  </Badge>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{formatDateTime(broker.lastSyncAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
