"use client";

import { useQuery } from "@tanstack/react-query";
import { KeyRound, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApiKeys } from "../api";
import { demoManagementOverview } from "../demo-data";
import { ManagementNav } from "./management-nav";
import { ManagementPageShell } from "./management-page-shell";
import { StatusBadge } from "./status-badge";

export function ApiUsersPage() {
  const query = useQuery({
    queryKey: ["management", "api-keys"],
    queryFn: fetchApiKeys,
    retry: false
  });
  const keys = query.data?.items ?? demoManagementOverview.apiKeys;

  return (
    <ManagementPageShell title="API Users" subtitle="Manage API access by attaching keys to existing users.">
      <ManagementNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New API Key
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo API users until the API key tables are migrated.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>API Key Registry</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Key</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Scopes</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last Used</th>
                <th className="px-5 py-3 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 font-medium">
                      <KeyRound className="h-4 w-4 text-primary" />
                      {key.name}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">{key.keyPrefix}...</div>
                  </td>
                  <td className="px-5 py-4">
                    <div>{key.user?.name ?? "Unknown user"}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{key.user?.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((scope) => (
                        <span key={scope} className="rounded-md bg-secondary px-2 py-1 font-mono text-[10px] text-muted-foreground">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={key.status} /></td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {key.lastUsedAt ? `${new Date(key.lastUsedAt).toLocaleString()} / ${key.lastUsedIp ?? "unknown"}` : "Never"}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "No expiry"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ManagementPageShell>
  );
}
