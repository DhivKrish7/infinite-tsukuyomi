import { LockKeyhole, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceWallet } from "../types";
import { formatMoney } from "../format";
import { FinanceStatusBadge } from "./finance-status-badge";

export function WalletTrackingPanel({ wallets }: { wallets: FinanceWallet[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="rounded-lg border border-white/10 bg-secondary/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
                  {wallet.status === "FROZEN" ? (
                    <LockKeyhole className="h-5 w-5 text-trading-red" />
                  ) : (
                    <WalletCards className="h-5 w-5 text-trading-green" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{wallet.client?.name ?? wallet.type}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {wallet.currency} / {wallet.type}
                  </div>
                </div>
              </div>
              <FinanceStatusBadge value={wallet.status} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <Metric label="Available" value={formatMoney(wallet.availableBalance, wallet.currency)} />
              <Metric label="Ledger" value={formatMoney(wallet.ledgerBalance, wallet.currency)} />
              <Metric label="Hold" value={formatMoney(wallet.holdBalance, wallet.currency)} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
