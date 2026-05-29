import type { Client, Platform } from "../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ClientsTable({ clients, platforms }: { clients: Client[]; platforms: Platform[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Recent Clients</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{clients.length} records in current scope</p>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Platform</th>
              <th className="px-5 py-3 font-medium">Balance</th>
              <th className="px-5 py-3 font-medium">PnL</th>
              <th className="px-5 py-3 font-medium">Presence</th>
              <th className="px-5 py-3 font-medium">KYC</th>
              <th className="px-5 py-3 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const platform = platforms.find((item) => item.id === client.platformId);

              return (
                <tr key={client.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-xs font-bold"
                        style={{
                          backgroundColor: `${platform?.color ?? "#00d4ff"}22`,
                          color: platform?.color ?? "#00d4ff"
                        }}
                      >
                        {client.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{client.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="rounded-md px-2 py-1 font-mono text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${platform?.color ?? "#00d4ff"}22`,
                        color: platform?.color ?? "#00d4ff"
                      }}
                    >
                      {platform?.name ?? "Unknown"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono">{client.balance}</td>
                  <td
                    className={cn(
                      "px-5 py-3 font-mono font-medium",
                      client.pnlDirection === "positive" ? "text-trading-green" : "text-trading-red"
                    )}
                  >
                    {client.pnl}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={client.presence === "online" ? "success" : "muted"}>
                      {client.presence ?? "offline"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        client.kyc === "verified" ? "success" : client.kyc === "pending" ? "warning" : "danger"
                      }
                    >
                      {client.kyc}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        client.risk === "low" ? "success" : client.risk === "medium" ? "warning" : "danger"
                      }
                    >
                      {client.risk}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
