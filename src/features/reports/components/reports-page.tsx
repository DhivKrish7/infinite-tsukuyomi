"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileClock, RefreshCw, TableProperties } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchReportDefinitions, fetchReportHistory, fetchReportViewer } from "../api";
import type { ReportType } from "../types";

const reportTypes: Array<{ label: string; value: ReportType }> = [
  { label: "Customer Reports", value: "CUSTOMER" },
  { label: "Trade Reports", value: "TRADE" },
  { label: "Transaction Reports", value: "TRANSACTION" }
];

const demoViewer = {
  type: "CUSTOMER" as ReportType,
  columns: ["name", "email", "status", "onboardingStage", "riskLevel"],
  exportConfig: { formats: ["CSV", "XLSX", "JSON"], delivery: "manual", scheduler: false },
  items: [
    { name: "Marcus Reed", email: "marcus.reed@nexusdemo.local", status: "ACTIVE", onboardingStage: "FUNDED", riskLevel: "LOW" },
    { name: "Aiko Tan", email: "aiko.tan@nexusdemo.local", status: "PENDING", onboardingStage: "KYC_REVIEW", riskLevel: "MEDIUM" }
  ]
};

export function ReportsPage() {
  const [type, setType] = useState<ReportType>("CUSTOMER");
  const definitionsQuery = useQuery({ queryKey: ["reports", "definitions"], queryFn: fetchReportDefinitions, retry: false });
  const historyQuery = useQuery({ queryKey: ["reports", "history"], queryFn: fetchReportHistory, retry: false });
  const viewerQuery = useQuery({ queryKey: ["reports", "viewer", type], queryFn: () => fetchReportViewer(type), retry: false });

  const definitions = definitionsQuery.data?.items ?? [];
  const history = historyQuery.data?.items ?? [];
  const viewer = viewerQuery.data ?? demoViewer;

  function refreshAll() {
    void definitionsQuery.refetch();
    void historyQuery.refetch();
    void viewerQuery.refetch();
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Read-only customer, trade, and transaction reporting.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {reportTypes.map((item) => (
              <Button key={item.value} variant={type === item.value ? "default" : "outline"} size="sm" onClick={() => setType(item.value)}>
                {item.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {viewerQuery.isError ? (
          <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
            Showing demo report rows until reporting data is available.
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          {definitions.length ? (
            definitions.map((definition) => (
              <Card key={definition.key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{definition.name}</div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{definition.type}</div>
                    </div>
                    <TableProperties className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {definition.exportConfig.formats.map((format) => (
                      <Badge key={format} variant="muted">{format}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            reportTypes.map((item) => (
              <Card key={item.value}>
                <CardContent className="p-4">
                  <div className="font-medium">{item.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Definition pending migration</div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle>Report Viewer</CardTitle>
            <div className="flex flex-wrap gap-2">
              {viewer.exportConfig.formats.map((format) => (
                <Button key={format} variant="outline" size="sm" disabled>
                  <Download className="h-4 w-4" />
                  {format}
                </Button>
              ))}
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {viewer.columns.slice(0, 8).map((column) => (
                    <th key={column} className="px-5 py-3 font-medium">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewer.items.map((item, index) => (
                  <tr key={index} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                    {viewer.columns.slice(0, 8).map((column) => (
                      <td key={column} className="px-5 py-4 text-muted-foreground">
                        {formatCell((item as Record<string, unknown>)[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileClock className="h-4 w-4 text-primary" />
              Report History
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Report</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Rows</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? (
                  history.map((item) => (
                    <tr key={item.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-medium">{item.definition?.name ?? "Ad hoc report"}</td>
                      <td className="px-5 py-4 text-muted-foreground">{item.type}</td>
                      <td className="px-5 py-4"><Badge variant={item.status === "COMPLETED" ? "success" : "muted"}>{item.status}</Badge></td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{item.rowCount}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-5 text-sm text-muted-foreground" colSpan={5}>No report history</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function formatCell(value: unknown) {
  if (value == null) return "-";
  if (typeof value === "object") {
    if ("name" in value && typeof value.name === "string") return value.name;
    return JSON.stringify(value);
  }
  return String(value);
}
