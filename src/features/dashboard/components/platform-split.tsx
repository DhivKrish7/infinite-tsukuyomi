import type { Platform } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlatformSplit({ platforms }: { platforms: Platform[] }) {
  const totalClients = platforms.reduce((sum, platform) => sum + platform.clients, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Split</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {platforms.map((platform) => {
          const percentage = totalClients ? Math.round((platform.clients / totalClients) * 1000) / 10 : 0;

          return (
            <div key={platform.id}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: platform.color }} />
                  <span>{platform.name}</span>
                </div>
                <span className="font-mono text-xs">{percentage}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${platform.color}, ${platform.color}99)`
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {platform.clients.toLocaleString()} clients · {platform.aum} AUM · {platform.type}
              </div>
            </div>
          );
        })}
        <div className="border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Pending Withdrawals</span>
            <span className="font-mono text-trading-amber">$84,200</span>
          </div>
          <div className="mt-2 flex justify-between text-muted-foreground">
            <span>Today&apos;s Deposits</span>
            <span className="font-mono text-trading-green">+$412,000</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
