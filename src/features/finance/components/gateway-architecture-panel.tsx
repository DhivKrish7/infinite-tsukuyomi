import { Cable, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentGatewayAdapter, PaymentGatewayConnection } from "../types";
import { FinanceStatusBadge } from "./finance-status-badge";

export function GatewayArchitecturePanel({
  adapters,
  connections
}: {
  adapters: PaymentGatewayAdapter[];
  connections: PaymentGatewayConnection[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateway Architecture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {adapters.map((adapter) => (
            <div key={adapter.key} className="rounded-lg border border-white/10 bg-secondary/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{adapter.displayName}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{adapter.key}</div>
                </div>
                <Badge variant="purple">{adapter.version}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {adapter.capabilities.map((capability) => (
                  <Badge key={capability} variant="muted">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {connections.map((connection) => (
            <div key={connection.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
                  {connection.status === "CONNECTED" ? (
                    <RadioTower className="h-4 w-4 text-trading-green" />
                  ) : (
                    <Cable className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{connection.displayName}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{connection.provider}</div>
                </div>
              </div>
              <FinanceStatusBadge value={connection.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
