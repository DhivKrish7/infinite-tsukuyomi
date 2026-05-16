export function formatMoney(value: string | number | null | undefined, compact = false) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2
  }).format(Number.isFinite(number) ? number : 0);
}

export function formatPercent(value: string | number | null | undefined) {
  const number = Number(value ?? 0);
  return `${Number.isFinite(number) ? number.toFixed(1) : "0.0"}%`;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}
