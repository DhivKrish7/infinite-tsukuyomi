import type { AnalyticsOverview } from "./types";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Analytics request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchAnalyticsOverview() {
  return fetchJson<AnalyticsOverview>("/api/analytics/overview");
}
