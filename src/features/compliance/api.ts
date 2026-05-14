import type { ComplianceOverview } from "./types";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Compliance request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchComplianceOverview() {
  return fetchJson<ComplianceOverview>("/api/compliance/overview");
}
