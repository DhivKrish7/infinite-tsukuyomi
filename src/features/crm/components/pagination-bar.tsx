"use client";

import { Button } from "@/components/ui/button";
import type { CrmListKey } from "@/stores/crm-store";
import { useCrmStore } from "@/stores/crm-store";

export function PaginationBar({
  listKey,
  total,
  pageCount
}: {
  listKey: CrmListKey;
  total: number;
  pageCount: number;
}) {
  const page = useCrmStore((state) => state.lists[listKey].page);
  const setListFilter = useCrmStore((state) => state.setListFilter);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-muted-foreground">
      <span>{total.toLocaleString()} records</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setListFilter(listKey, { page: page - 1 })}
        >
          Previous
        </Button>
        <span className="font-mono text-xs">
          {page} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => setListFilter(listKey, { page: page + 1 })}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
