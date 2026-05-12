"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CrmListKey } from "@/stores/crm-store";
import { useCrmStore } from "@/stores/crm-store";

export function CrmFilters({
  listKey,
  statuses,
  stages
}: {
  listKey: CrmListKey;
  statuses: string[];
  stages: string[];
}) {
  const list = useCrmStore((state) => state.lists[listKey]);
  const setListFilter = useCrmStore((state) => state.setListFilter);

  return (
    <div className="trading-surface grid gap-3 rounded-xl p-4 md:grid-cols-[minmax(220px,1fr)_180px_220px_160px]">
      <label className="flex items-center gap-2 rounded-md border border-white/10 bg-secondary px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={list.q}
          onChange={(event) => setListFilter(listKey, { q: event.target.value })}
          className="border-0 bg-transparent px-0 focus-visible:ring-0"
          placeholder="Search name, email, phone..."
        />
      </label>
      <select
        value={list.status}
        onChange={(event) => setListFilter(listKey, { status: event.target.value })}
        className="h-10 rounded-md border border-border bg-secondary px-3 text-sm outline-none"
      >
        <option value="">All statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <select
        value={list.stage}
        onChange={(event) => setListFilter(listKey, { stage: event.target.value })}
        className="h-10 rounded-md border border-border bg-secondary px-3 text-sm outline-none"
      >
        <option value="">All stages</option>
        {stages.map((stage) => (
          <option key={stage} value={stage}>
            {stage.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <Input
        value={list.tag}
        onChange={(event) => setListFilter(listKey, { tag: event.target.value })}
        placeholder="Tag"
      />
    </div>
  );
}
