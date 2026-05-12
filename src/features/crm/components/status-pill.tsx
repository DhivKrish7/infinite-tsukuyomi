import { Badge } from "@/components/ui/badge";

export function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const variant =
    normalized.includes("active") ||
    normalized.includes("approved") ||
    normalized.includes("qualified") ||
    normalized.includes("converted") ||
    normalized.includes("verified")
      ? "success"
      : normalized.includes("pending") ||
          normalized.includes("review") ||
          normalized.includes("contacted") ||
          normalized.includes("progress")
        ? "warning"
        : normalized.includes("high") ||
            normalized.includes("urgent") ||
            normalized.includes("suspended") ||
            normalized.includes("failed") ||
            normalized.includes("lost")
          ? "danger"
          : "muted";

  return <Badge variant={variant}>{value.replaceAll("_", " ")}</Badge>;
}
