import { ClipboardCheck, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KycCase } from "../types";
import { formatDateTime } from "../format";
import { ComplianceStatusBadge } from "./compliance-status-badge";

export function ManualReviewPanel({ cases }: { cases: KycCase[] }) {
  const reviewCases = cases.filter((kycCase) => kycCase.reviews?.some((review) => review.status === "PENDING"));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(reviewCases.length ? reviewCases : cases.slice(0, 4)).map((kycCase) => {
          const review = kycCase.reviews?.[0];

          return (
            <div key={kycCase.id} className="rounded-lg border border-white/10 bg-secondary/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
                    {review?.status === "PENDING" ? (
                      <Clock3 className="h-4 w-4 text-trading-amber" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4 text-trading-green" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{kycCase.client.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {kycCase.workflowStage.replaceAll("_", " ")}
                    </div>
                  </div>
                </div>
                <ComplianceStatusBadge value={review?.status ?? kycCase.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{formatDateTime(kycCase.submittedAt)}</span>
                <span className="font-medium">{kycCase.assignedReviewer?.name ?? "Unassigned"}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
