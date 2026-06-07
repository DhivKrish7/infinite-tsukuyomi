"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchManagementUsers } from "../api";
import { demoManagementOverview } from "../demo-data";
import { ManagementNav } from "./management-nav";
import { ManagementPageShell } from "./management-page-shell";
import { StatusBadge } from "./status-badge";

export function UsersPage() {
  const query = useQuery({
    queryKey: ["management", "users"],
    queryFn: fetchManagementUsers,
    retry: false
  });
  const users = query.data?.items ?? demoManagementOverview.users;

  return (
    <ManagementPageShell title="Users" subtitle="Inspect existing auth users, roles, sessions, API keys, and restriction coverage.">
      <ManagementNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant="purple">Existing auth users</Badge>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo users until the management phase 2 migration is applied.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Roles</th>
                <th className="px-5 py-3 font-medium">Last Login</th>
                <th className="px-5 py-3 font-medium">Security</th>
                <th className="px-5 py-3 font-medium">Assignments</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="font-medium">{user.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={user.isActive ? "ACTIVE" : "SUSPENDED"} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span key={role.id} className="rounded-md bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      {user._count?.refreshTokens ?? 0} sessions / {user._count?.apiKeys ?? 0} keys /{" "}
                      {user._count?.ipRestrictions ?? 0} IP rules
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {user._count?.assignedClients ?? 0} clients / {user._count?.assignedLeads ?? 0} leads
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
