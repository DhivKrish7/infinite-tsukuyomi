"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrmStore } from "@/stores/crm-store";
import { fetchLeads } from "../api";
import { demoLeads } from "../demo-data";
import type { LeadRecord, PaginatedResponse } from "../types";
import { CrmFilters } from "./crm-filters";
import { CrmPageShell } from "./crm-page-shell";
import { PaginationBar } from "./pagination-bar";
import { StatusPill } from "./status-pill";

const leadStatuses = ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "CONVERTED", "LOST"];
const stages = ["NEW_LEAD", "CONTACTED", "APPLICATION_STARTED", "KYC_SUBMITTED", "KYC_REVIEW", "APPROVED"];

export function LeadsPage() {
  const filters = useCrmStore((state) => state.lists.leads);
  const query = useQuery({
    queryKey: ["crm", "leads", filters],
    queryFn: () => fetchLeads(filters),
    retry: false
  });

  const fallback: PaginatedResponse<LeadRecord> = {
    items: demoLeads,
    meta: { total: demoLeads.length, page: 1, pageSize: 10, pageCount: 1 }
  };
  const data = query.data ?? fallback;

  return (
    <CrmPageShell title="Leads Management" subtitle="Capture, qualify, assign, and convert prospects into funded traders.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CrmFilters listKey="leads" statuses={leadStatuses} stages={stages} />
        <Button className="md:self-start">
          <Plus className="h-4 w-4" />
          New Lead
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo lead records until PostgreSQL is configured and migrated.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Lead Queue</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Lead</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Stage</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Tags</th>
                <th className="px-5 py-3 font-medium">Activity</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((lead) => (
                <tr key={lead.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="font-medium">{lead.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{lead.email ?? lead.phone}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div>{lead.source ?? "Direct"}</div>
                    <div className="text-xs text-muted-foreground">{lead.campaign ?? "No campaign"}</div>
                  </td>
                  <td className="px-5 py-4">{lead.assignedTo?.name ?? "Unassigned"}</td>
                  <td className="px-5 py-4"><StatusPill value={lead.status} /></td>
                  <td className="px-5 py-4"><StatusPill value={lead.onboardingStage} /></td>
                  <td className="px-5 py-4">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${lead.score}%` }} />
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">{lead.score}/100</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {lead.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-md px-2 py-1 font-mono text-[10px]"
                          style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {lead._count?.notes ?? 0} notes · {lead._count?.communications ?? 0} comms ·{" "}
                    {lead._count?.tasks ?? 0} tasks
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationBar listKey="leads" total={data.meta.total} pageCount={data.meta.pageCount} />
      </Card>
    </CrmPageShell>
  );
}
