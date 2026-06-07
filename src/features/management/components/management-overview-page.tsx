"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Building2, Crown, KeyRound, RefreshCw, Shield, ShieldCheck, Users, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchManagementOverview } from "../api";
import { demoManagementOverview } from "../demo-data";
import { ManagementNav } from "./management-nav";
import { ManagementPageShell } from "./management-page-shell";
import { StatusBadge } from "./status-badge";

export function ManagementOverviewPage() {
  const query = useQuery({
    queryKey: ["management", "overview"],
    queryFn: fetchManagementOverview,
    retry: false
  });
  const data = query.data ?? demoManagementOverview;

  return (
    <ManagementPageShell
      title="Management Console"
      subtitle="Enterprise administration foundation for brands, desks, permission groups, and change visibility."
    >
      <ManagementNav />

      <div className="flex items-center justify-between gap-3">
        <Badge variant="purple">Phase 1</Badge>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo management data until the expansion foundation migration is applied.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={Crown} label="Brands" value={data.metrics.brands} />
        <MetricCard icon={Building2} label="Desks" value={data.metrics.desks} />
        <MetricCard icon={UsersRound} label="Permission groups" value={data.metrics.permissionGroups} />
        <MetricCard icon={Users} label="Users" value={data.metrics.users} />
        <MetricCard icon={KeyRound} label="API users" value={data.metrics.apiUsers} />
        <MetricCard icon={Shield} label="IP rules" value={data.metrics.ipRestrictions} />
        <MetricCard icon={Activity} label="Admin changes" value={data.metrics.adminChanges} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.75fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-secondary/60 p-3">
                <div>
                  <div className="font-medium">{brand.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{brand.slug}</div>
                </div>
                <StatusBadge status={brand.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentChanges.length ? (
              data.recentChanges.map((change) => (
                <div key={change.id} className="rounded-md border border-white/10 bg-secondary/60 p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <div className="truncate text-sm font-medium">{change.action}</div>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {change.entity} - {new Date(change.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-white/10 bg-secondary/60 p-4 text-sm text-muted-foreground">
                No admin changes recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </ManagementPageShell>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof Crown; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
