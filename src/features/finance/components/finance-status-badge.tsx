import type * as React from "react";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const toneByStatus: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  CONNECTED: "success",
  COMPLETED: "success",
  APPROVED: "success",
  PENDING: "warning",
  OPEN: "warning",
  IN_REVIEW: "warning",
  ESCALATED: "danger",
  HIGH: "danger",
  CRITICAL: "danger",
  REJECTED: "danger",
  FAILED: "danger",
  FROZEN: "danger",
  DEGRADED: "warning",
  DISCONNECTED: "muted",
  CLEARED: "success"
};

export function FinanceStatusBadge({ value }: { value: string }) {
  return <Badge variant={toneByStatus[value] ?? "muted"}>{value.replaceAll("_", " ")}</Badge>;
}
