"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBrands } from "../api";
import { demoManagementOverview } from "../demo-data";
import { ManagementNav } from "./management-nav";
import { ManagementPageShell } from "./management-page-shell";
import { StatusBadge } from "./status-badge";

export function BrandsPage() {
  const query = useQuery({
    queryKey: ["management", "brands"],
    queryFn: fetchBrands,
    retry: false
  });
  const data = query.data?.items ?? demoManagementOverview.brands;

  return (
    <ManagementPageShell title="Brands" subtitle="Manage broker brands without changing existing client or trading modules.">
      <ManagementNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Brand
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo brands until the management tables are migrated.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Brand Registry</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Brand</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Desks</th>
                <th className="px-5 py-3 font-medium">Permission Groups</th>
                <th className="px-5 py-3 font-medium">Created By</th>
              </tr>
            </thead>
            <tbody>
              {data.map((brand) => (
                <tr key={brand.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="font-medium">{brand.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{brand.slug}</div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={brand.status} /></td>
                  <td className="px-5 py-4">{brand._count?.desks ?? 0}</td>
                  <td className="px-5 py-4">{brand._count?.permissionGroups ?? 0}</td>
                  <td className="px-5 py-4">{brand.createdBy?.name ?? "System"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ManagementPageShell>
  );
}
