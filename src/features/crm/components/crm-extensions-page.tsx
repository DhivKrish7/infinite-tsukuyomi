"use client";

import { useQuery } from "@tanstack/react-query";
import { Columns3, Eye, Filter, Plus, RefreshCw, SlidersHorizontal, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchColumnPreferences,
  fetchCrmExtensions,
  fetchCustomFields,
  fetchSavedFilters,
  fetchSavedViews
} from "../api";
import { CrmPageShell } from "./crm-page-shell";

const fallbackModules = [
  { id: "module-saved-filters", key: "saved-filters", name: "Saved Filters", description: null, isEnabled: false, settings: null, createdAt: "", updatedAt: "" },
  { id: "module-saved-views", key: "saved-views", name: "Saved Views", description: null, isEnabled: false, settings: null, createdAt: "", updatedAt: "" },
  { id: "module-editable-columns", key: "editable-columns", name: "Editable Columns", description: null, isEnabled: false, settings: null, createdAt: "", updatedAt: "" },
  { id: "module-custom-fields", key: "custom-fields", name: "Custom Fields", description: null, isEnabled: false, settings: null, createdAt: "", updatedAt: "" }
] as const;

export function CrmExtensionsPage() {
  const modulesQuery = useQuery({ queryKey: ["crm", "extensions"], queryFn: fetchCrmExtensions, retry: false });
  const filtersQuery = useQuery({ queryKey: ["crm", "saved-filters"], queryFn: fetchSavedFilters, retry: false });
  const viewsQuery = useQuery({ queryKey: ["crm", "saved-views"], queryFn: fetchSavedViews, retry: false });
  const columnsQuery = useQuery({ queryKey: ["crm", "columns"], queryFn: fetchColumnPreferences, retry: false });
  const fieldsQuery = useQuery({ queryKey: ["crm", "custom-fields"], queryFn: fetchCustomFields, retry: false });

  const modules = modulesQuery.data?.items ?? fallbackModules;
  const filters = filtersQuery.data?.items ?? [];
  const views = viewsQuery.data?.items ?? [];
  const columns = columnsQuery.data?.items ?? [];
  const fields = fieldsQuery.data?.items ?? [];

  function refreshAll() {
    void modulesQuery.refetch();
    void filtersQuery.refetch();
    void viewsQuery.refetch();
    void columnsQuery.refetch();
    void fieldsQuery.refetch();
  }

  return (
    <CrmPageShell title="CRM Extensions" subtitle="Optional CRM modules that leave existing lead and client workflows intact.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {modules.map((module) => (
            <Badge key={module.key} variant={module.isEnabled ? "success" : "muted"}>
              {module.name}
            </Badge>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {modulesQuery.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing extension defaults until the CRM extension migration is applied.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {modules.map((module) => (
          <Card key={module.key}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="text-sm font-medium">{module.name}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {module.isEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>
              {module.isEnabled ? <ToggleRight className="h-6 w-6 text-trading-green" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ExtensionPanel
          icon={Filter}
          title="Saved Filters"
          action="New Filter"
          headers={["Name", "Target", "Shared", "Owner"]}
          rows={filters.map((item) => [item.name, item.target, item.isShared ? "Yes" : "No", item.owner?.name ?? "You"])}
        />
        <ExtensionPanel
          icon={Eye}
          title="Saved Views"
          action="New View"
          headers={["Name", "Target", "Default", "Shared"]}
          rows={views.map((item) => [item.name, item.target, item.isDefault ? "Yes" : "No", item.isShared ? "Yes" : "No"])}
        />
        <ExtensionPanel
          icon={Columns3}
          title="Editable Columns"
          action="New Column"
          headers={["Column", "Target", "Visible", "Pinned"]}
          rows={columns.map((item) => [item.label, item.target, item.visible ? "Yes" : "No", item.pinned ? "Yes" : "No"])}
        />
        <ExtensionPanel
          icon={SlidersHorizontal}
          title="Custom Fields"
          action="New Field"
          headers={["Field", "Target", "Type", "Status"]}
          rows={fields.map((item) => [item.label, item.target, item.type, item.active ? "Active" : "Inactive"])}
        />
      </section>
    </CrmPageShell>
  );
}

function ExtensionPanel({
  icon: Icon,
  title,
  action,
  headers,
  rows
}: {
  icon: typeof Filter;
  title: string;
  action: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          {action}
        </Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {headers.map((header) => (
                <th key={header} className="px-5 py-3 font-medium">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                  {row.map((value, cellIndex) => (
                    <td key={`${title}-${index}-${cellIndex}`} className="px-5 py-4">
                      {cellIndex === 0 ? <span className="font-medium">{value}</span> : <span className="text-muted-foreground">{value}</span>}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-5 text-sm text-muted-foreground" colSpan={headers.length}>
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
