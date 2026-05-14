import type * as React from "react";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const toneByStatus: Record<string, BadgeVariant> = {
  VERIFIED: "success",
  APPROVED: "success",
  ACCEPTED: "success",
  CLEAR: "success",
  CONNECTED: "success",
  PENDING: "warning",
  IN_REVIEW: "warning",
  UPLOADED: "warning",
  PROCESSING: "warning",
  POSSIBLE_MATCH: "warning",
  INFORMATION_REQUESTED: "warning",
  FLAGGED: "danger",
  FAILED: "danger",
  REJECTED: "danger",
  CONFIRMED_MATCH: "danger",
  NEEDS_RESUBMISSION: "danger",
  HIGH: "danger",
  CRITICAL: "danger",
  ESCALATED: "danger",
  DEGRADED: "warning",
  DISCONNECTED: "muted"
};

export function ComplianceStatusBadge({ value }: { value: string }) {
  return <Badge variant={toneByStatus[value] ?? "muted"}>{value.replaceAll("_", " ")}</Badge>;
}
