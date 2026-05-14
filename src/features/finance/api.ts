import type { FinanceOverview } from "./types";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Finance request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchFinanceOverview() {
  return fetchJson<FinanceOverview>("/api/finance/overview");
}
