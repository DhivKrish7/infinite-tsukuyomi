"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrmStore } from "@/stores/crm-store";
import { fetchClients } from "../api";
import { demoClients } from "../demo-data";
import type { ClientRecord, PaginatedResponse } from "../types";
import { CrmFilters } from "./crm-filters";
import { CrmPageShell } from "./crm-page-shell";
import { PaginationBar } from "./pagination-bar";
import { StatusPill } from "./status-pill";

const clientStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"];
const stages = [
  "APPROVED",
  "FUNDED",
  "ACTIVE_TRADER",
  "KYC_REVIEW",
  "STALLED",
  "REJECTED"
];

export function ClientsPage() {
  const filters = useCrmStore((state) => state.lists.clients);
  const query = useQuery({
    queryKey: ["crm", "clients", filters],
    queryFn: () => fetchClients(filters),
    retry: false
  });

  const fallback: PaginatedResponse<ClientRecord> = {
    items: demoClients,
    meta: { total: demoClients.length, page: 1, pageSize: 10, pageCount: 1 }
  };
  const data = query.data ?? fallback;

  return (
    <CrmPageShell title="Client Management" subtitle="Manage active traders, ownership, notes, risk, and onboarding.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CrmFilters listKey="clients" statuses={clientStatuses} stages={stages} />
        <Button className="md:self-start">
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo client records until PostgreSQL is configured and migrated.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Onboarding</th>
                <th className="px-5 py-3 font-medium">Risk</th>
                <th className="px-5 py-3 font-medium">Tags</th>
                <th className="px-5 py-3 font-medium">Activity</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((client) => (
                <tr key={client.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="font-medium">{client.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{client.email}</div>
                  </td>
                  <td className="px-5 py-4">{client.assignedTo?.name ?? "Unassigned"}</td>
                  <td className="px-5 py-4"><StatusPill value={client.status} /></td>
                  <td className="px-5 py-4"><StatusPill value={client.onboardingStage} /></td>
                  <td className="px-5 py-4"><StatusPill value={client.riskLevel} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
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
                    {client._count?.notes ?? 0} notes · {client._count?.communications ?? 0} comms ·{" "}
                    {client._count?.tasks ?? 0} tasks
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationBar listKey="clients" total={data.meta.total} pageCount={data.meta.pageCount} />
      </Card>
    </CrmPageShell>
  );
}
