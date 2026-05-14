"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, History, Plus, Scale, ShieldCheck, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchComplianceOverview } from "../api";
import { demoComplianceOverview } from "../demo-data";
import type { KycCase } from "../types";
import { ComplianceAuditPanel } from "./compliance-audit-panel";
import { ComplianceKpiGrid } from "./compliance-kpi-grid";
import { ComplianceNotesPanel } from "./compliance-notes-panel";
import { CompliancePageShell } from "./compliance-page-shell";
import { DocumentUploadPanel } from "./document-upload-panel";
import { KycCaseTable } from "./kyc-case-table";
import { ManualReviewPanel } from "./manual-review-panel";
import { SanctionsScreeningPanel } from "./sanctions-screening-panel";

export type ComplianceView = "overview" | "reviews" | "screening" | "documents" | "audit";

const viewLinks: Array<{ view: ComplianceView; label: string; href: string; icon: LucideIcon }> = [
  { view: "overview", label: "KYC Queue", href: "/kyc", icon: ShieldCheck },
  { view: "reviews", label: "Reviews", href: "/kyc/reviews", icon: UserCheck },
  { view: "screening", label: "Screening", href: "/kyc/screening", icon: Scale },
  { view: "documents", label: "Documents", href: "/kyc/documents", icon: FileText },
  { view: "audit", label: "Audit", href: "/kyc/audit", icon: History }
];

export function CompliancePage({ view = "overview" }: { view?: ComplianceView }) {
  const query = useQuery({
    queryKey: ["compliance", "overview"],
    queryFn: fetchComplianceOverview,
    retry: false
  });
  const data = query.data ?? demoComplianceOverview;
  const cases = filterCases(data.cases, view);

  return (
    <CompliancePageShell
      title="KYC and AML Compliance"
      subtitle="Document intake, verification states, manual review, risk scoring, sanctions screening, notes, and audit trail."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {viewLinks.map((item) => (
            <Button key={item.view} asChild variant={view === item.view ? "default" : "outline"} size="sm">
              <Link href={item.href as never}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          KYC Case
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo compliance records until PostgreSQL is configured and migrated.
        </div>
      ) : null}

      <ComplianceKpiGrid metrics={data.metrics} />

      {view === "documents" ? <DocumentUploadPanel documents={data.documents} /> : null}
      {view === "screening" ? (
        <SanctionsScreeningPanel
          screenings={data.screenings}
          adapters={data.providerAdapters}
          providers={data.providers}
        />
      ) : null}
      {view === "audit" ? <ComplianceAuditPanel events={data.auditEvents} /> : null}

      {view !== "documents" && view !== "screening" && view !== "audit" ? <KycCaseTable cases={cases} /> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ManualReviewPanel cases={data.cases} />
        <DocumentUploadPanel documents={data.documents} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SanctionsScreeningPanel
          screenings={data.screenings}
          adapters={data.providerAdapters}
          providers={data.providers}
        />
        <ComplianceNotesPanel notes={data.notes} />
      </section>

      <ComplianceAuditPanel events={data.auditEvents} />
    </CompliancePageShell>
  );
}

function filterCases(cases: KycCase[], view: ComplianceView) {
  if (view === "reviews") return cases.filter((kycCase) => kycCase.reviews?.some((review) => review.status === "PENDING"));
  return cases;
}
