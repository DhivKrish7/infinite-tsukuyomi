"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPermissionGroups } from "../api";
import { demoManagementOverview } from "../demo-data";
import { ManagementNav } from "./management-nav";
import { ManagementPageShell } from "./management-page-shell";
import { StatusBadge } from "./status-badge";

export function PermissionGroupsPage() {
  const query = useQuery({
    queryKey: ["management", "permission-groups"],
    queryFn: fetchPermissionGroups,
    retry: false
  });
  const data = query.data?.items ?? demoManagementOverview.permissionGroups;

  return (
    <ManagementPageShell
      title="Permission Groups"
      subtitle="Manage enterprise permission groups for brands and desks using existing RBAC permissions."
    >
      <ManagementNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Group
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo permission groups until the management tables are migrated.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Permission Group Registry</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Group</th>
                <th className="px-5 py-3 font-medium">Brand</th>
                <th className="px-5 py-3 font-medium">Desk</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Permissions</th>
                <th className="px-5 py-3 font-medium">Created By</th>
              </tr>
            </thead>
            <tbody>
              {data.map((group) => (
                <tr key={group.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="font-medium">{group.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{group.slug}</div>
                  </td>
                  <td className="px-5 py-4">{group.brand?.name ?? "All brands"}</td>
                  <td className="px-5 py-4">{group.desk?.name ?? "All desks"}</td>
                  <td className="px-5 py-4"><StatusBadge status={group.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-md flex-wrap gap-1">
                      {(group.permissions ?? []).slice(0, 4).map((permission) => (
                        <Badge key={permission} variant="muted">
                          {permission}
                        </Badge>
                      ))}
                      {(group.permissions?.length ?? 0) > 4 ? (
                        <Badge variant="purple">+{(group.permissions?.length ?? 0) - 4}</Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">{group.createdBy?.name ?? "System"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ManagementPageShell>
  );
}
