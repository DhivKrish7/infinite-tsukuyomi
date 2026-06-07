"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchIpRestrictions } from "../api";
import { demoManagementOverview } from "../demo-data";
import { ManagementNav } from "./management-nav";
import { ManagementPageShell } from "./management-page-shell";
import { StatusBadge } from "./status-badge";

export function IpWhitelistPage() {
  const query = useQuery({
    queryKey: ["management", "ip-restrictions"],
    queryFn: fetchIpRestrictions,
    retry: false
  });
  const rules = query.data?.items ?? demoManagementOverview.ipRestrictions;

  return (
    <ManagementPageShell title="IP Whitelist" subtitle="Manage tenant-wide and user-scoped IP restrictions for console and API access.">
      <ManagementNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo IP rules until the restriction tables are migrated.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Restriction Rules</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Rule</th>
                <th className="px-5 py-3 font-medium">Range</th>
                <th className="px-5 py-3 font-medium">Mode</th>
                <th className="px-5 py-3 font-medium">Scope</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Shield className="h-4 w-4 text-primary" />
                      {rule.label}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">{rule.createdBy?.name ?? "System"}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs">{rule.cidr}</td>
                  <td className="px-5 py-4"><StatusBadge status={rule.mode} /></td>
                  <td className="px-5 py-4">{rule.user ? rule.user.name : "Tenant-wide"}</td>
                  <td className="px-5 py-4"><StatusBadge status={rule.status} /></td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{rule.notes ?? "No notes"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ManagementPageShell>
  );
}
