import { RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { LivePrice } from "../types";

export function LivePriceStrip({ prices }: { prices: LivePrice[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 text-sm font-medium">
          <RadioTower className="h-4 w-4 text-primary" />
          Live Prices
          <Badge variant={prices.length ? "success" : "muted"}>{prices.length ? "Streaming" : "Waiting"}</Badge>
        </div>
        <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {prices.length ? (
            prices.slice(0, 5).map((price) => (
              <div key={price.key} className="rounded-md border border-white/10 bg-secondary/60 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-primary">{price.symbol}</span>
                  <span className="truncate text-[10px] text-muted-foreground">{price.broker}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span>{price.bid}</span>
                  <span className="text-muted-foreground">{price.ask}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-white/10 bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
              Connecting to realtime simulation...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
