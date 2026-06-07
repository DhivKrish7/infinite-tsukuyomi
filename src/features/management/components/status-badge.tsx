import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const variant = status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "danger" : "muted";

  return <Badge variant={variant}>{status}</Badge>;
}
