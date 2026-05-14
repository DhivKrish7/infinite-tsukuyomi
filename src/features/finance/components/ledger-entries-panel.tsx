import { BookOpenCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { LedgerEntry } from "../types";
import { formatDateTime, formatMoney } from "../format";

export function LedgerEntriesPanel({ entries }: { entries: LedgerEntry[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Ledger Entries</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Entry</th>
              <th className="px-5 py-3 font-medium">Direction</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Balance After</th>
              <th className="px-5 py-3 font-medium">Occurred</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-secondary">
                      <BookOpenCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{entry.entryType}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{entry.reference ?? entry.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{entry.direction}</td>
                <td className="px-5 py-4">{formatMoney(entry.amount, entry.currency)}</td>
                <td className="px-5 py-4">{formatMoney(entry.balanceAfter, entry.currency)}</td>
                <td className="px-5 py-4 text-muted-foreground">{formatDateTime(entry.occurredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
