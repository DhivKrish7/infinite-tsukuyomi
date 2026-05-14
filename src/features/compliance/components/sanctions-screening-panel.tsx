import { RadioTower, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SanctionsScreening, ScreeningProviderAdapter, ScreeningProviderConnection } from "../types";
import { formatDateTime } from "../format";
import { ComplianceStatusBadge } from "./compliance-status-badge";

export function SanctionsScreeningPanel({
  screenings,
  adapters,
  providers
}: {
  screenings: SanctionsScreening[];
  adapters: ScreeningProviderAdapter[];
  providers: ScreeningProviderConnection[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sanctions Screening Architecture</CardTitle>
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

        {providers.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
                <RadioTower className="h-4 w-4 text-trading-green" />
              </div>
              <div>
                <div className="font-medium">{provider.displayName}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{provider.provider}</div>
              </div>
            </div>
            <ComplianceStatusBadge value={provider.status} />
          </div>
        ))}

        {screenings.map((screening) => (
          <div key={screening.id} className="rounded-lg border border-white/10 bg-secondary/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
                  <Scale className="h-4 w-4 text-trading-purple" />
                </div>
                <div>
                  <div className="font-medium">{screening.client?.name ?? "Screening result"}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {screening.providerReference ?? screening.id} / {formatDateTime(screening.screenedAt)}
                  </div>
                </div>
              </div>
              <ComplianceStatusBadge value={screening.status} />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {screening.matchCount} matches / risk score {screening.riskScore}/100
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
