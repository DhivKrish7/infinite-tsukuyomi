import { History } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplianceAuditEvent } from "../types";
import { formatDateTime } from "../format";

export function ComplianceAuditPanel({ events }: { events: ComplianceAuditEvent[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Entity</th>
              <th className="px-5 py-3 font-medium">Actor</th>
              <th className="px-5 py-3 font-medium">Metadata</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-secondary">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{event.action.replaceAll("_", " ")}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{event.entity}</td>
                <td className="px-5 py-4">{event.actor?.name ?? "System"}</td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                  {event.metadata ? JSON.stringify(event.metadata).slice(0, 80) : "None"}
                </td>
                <td className="px-5 py-4 text-muted-foreground">{formatDateTime(event.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
