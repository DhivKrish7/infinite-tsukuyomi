import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelStage } from "../types";

export function ConversionFunnelPanel({ data }: { data: FunnelStage[] }) {
  const max = Math.max(...data.map((stage) => stage.count), 1);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Conversion Funnel</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Lead to funded active trader progression</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((stage) => (
          <div key={stage.stage}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{stage.stage}</span>
              <span className="font-mono text-xs text-muted-foreground">{stage.count}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max((stage.count / max) * 100, stage.count ? 8 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
