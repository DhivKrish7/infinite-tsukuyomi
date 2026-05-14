import { ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { KycCase } from "../types";
import { formatDateTime } from "../format";
import { ComplianceStatusBadge } from "./compliance-status-badge";

export function KycCaseTable({ cases }: { cases: KycCase[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>KYC Case Queue</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">State</th>
              <th className="px-5 py-3 font-medium">Stage</th>
              <th className="px-5 py-3 font-medium">Risk</th>
              <th className="px-5 py-3 font-medium">Documents</th>
              <th className="px-5 py-3 font-medium">Screening</th>
              <th className="px-5 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((kycCase) => (
              <tr key={kycCase.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-secondary">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{kycCase.client.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{kycCase.client.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <ComplianceStatusBadge value={kycCase.status} />
                </td>
                <td className="px-5 py-4">{kycCase.workflowStage.replaceAll("_", " ")}</td>
                <td className="px-5 py-4">
                  <ComplianceStatusBadge value={kycCase.riskLevel} />
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{kycCase.riskScore}/100</div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{kycCase.documents?.length ?? 0}</td>
                <td className="px-5 py-4 text-muted-foreground">
                  {kycCase.screenings?.[0]?.status ? <ComplianceStatusBadge value={kycCase.screenings[0].status} /> : "Not screened"}
                </td>
                <td className="px-5 py-4 text-muted-foreground">{formatDateTime(kycCase.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
