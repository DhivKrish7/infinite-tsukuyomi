import { FileCheck2, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KycDocument } from "../types";
import { formatDateTime, formatFileSize } from "../format";
import { ComplianceStatusBadge } from "./compliance-status-badge";

export function DocumentUploadPanel({ documents }: { documents: KycDocument[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Uploads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((document) => (
          <div key={document.id} className="rounded-lg border border-white/10 bg-secondary/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
                  {document.status === "ACCEPTED" ? (
                    <FileCheck2 className="h-5 w-5 text-trading-green" />
                  ) : (
                    <FileWarning className="h-5 w-5 text-trading-amber" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{document.fileName}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {document.type.replaceAll("_", " ")} / {formatFileSize(document.byteSize)}
                  </div>
                </div>
              </div>
              <ComplianceStatusBadge value={document.status} />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {document.client?.name ?? "Client"} / uploaded {formatDateTime(document.uploadedAt)}
            </div>
            {document.rejectionReason ? <p className="mt-2 text-sm text-trading-red">{document.rejectionReason}</p> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
