export function formatMoney(value: string | number | null | undefined, currency = "USD") {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number.isFinite(number) ? number : 0);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Pending";
  return new Date(value).toLocaleString();
}
