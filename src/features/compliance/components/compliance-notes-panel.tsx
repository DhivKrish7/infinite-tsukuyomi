import { StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplianceNote } from "../types";
import { formatDateTime } from "../format";
import { ComplianceStatusBadge } from "./compliance-status-badge";

export function ComplianceNotesPanel({ notes }: { notes: ComplianceNote[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="rounded-lg border border-white/10 bg-secondary/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
                  <StickyNote className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{note.client?.name ?? "Compliance note"}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {note.author?.name ?? "System"} / {formatDateTime(note.createdAt)}
                  </div>
                </div>
              </div>
              <ComplianceStatusBadge value={note.visibility} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{note.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
