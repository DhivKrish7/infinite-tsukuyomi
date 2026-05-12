"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchClients, fetchLeads, fetchTasks } from "../api";
import { demoClients, demoLeads, demoTasks } from "../demo-data";
import { CrmPageShell } from "./crm-page-shell";
import { StatusPill } from "./status-pill";

const pipelineStages = [
  "NEW_LEAD",
  "CONTACTED",
  "APPLICATION_STARTED",
  "KYC_SUBMITTED",
  "KYC_REVIEW",
  "APPROVED",
  "FUNDED",
  "ACTIVE_TRADER"
];

export function OnboardingPage() {
  const leadsQuery = useQuery({ queryKey: ["crm", "pipeline-leads"], queryFn: () => fetchLeads({ pageSize: 100 }), retry: false });
  const clientsQuery = useQuery({ queryKey: ["crm", "pipeline-clients"], queryFn: () => fetchClients({ pageSize: 100 }), retry: false });
  const tasksQuery = useQuery({ queryKey: ["crm", "tasks", "open"], queryFn: () => fetchTasks({ status: "OPEN", pageSize: 20 }), retry: false });

  const leads = leadsQuery.data?.items ?? demoLeads;
  const clients = clientsQuery.data?.items ?? demoClients;
  const tasks = tasksQuery.data?.items ?? demoTasks;

  const grouped = useMemo(
    () =>
      pipelineStages.map((stage) => ({
        stage,
        records: [
          ...leads.filter((lead) => lead.onboardingStage === stage).map((lead) => ({ ...lead, kind: "Lead" })),
          ...clients.filter((client) => client.onboardingStage === stage).map((client) => ({ ...client, kind: "Client" }))
        ]
      })),
    [clients, leads]
  );

  return (
    <CrmPageShell title="Onboarding Pipeline" subtitle="Track lead-to-client progress, ownership, follow-ups, and stalled accounts.">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {grouped.map((column) => (
            <Card key={column.stage} className="min-h-56 overflow-hidden">
              <CardHeader>
                <div>
                  <CardTitle>{column.stage.replaceAll("_", " ")}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">{column.records.length} records</p>
                </div>
              </CardHeader>
              <div className="space-y-3 p-4">
                {column.records.map((record) => (
                  <div key={`${record.kind}-${record.id}`} className="rounded-lg border border-white/10 bg-secondary/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{record.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{record.kind}</div>
                      </div>
                      <StatusPill value={"status" in record ? record.status : "OPEN"} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {record.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-md px-2 py-1 font-mono text-[10px]"
                          style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {!column.records.length ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
                    No records
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Task Reminders</CardTitle>
          </CardHeader>
          <div>
            {tasks.map((task) => (
              <div key={task.id} className="border-b border-white/10 px-5 py-4 last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {task.client?.name ?? task.lead?.name ?? "General"} · {new Date(task.dueAt).toLocaleString()}
                    </div>
                  </div>
                  <StatusPill value={task.priority} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </CrmPageShell>
  );
}
