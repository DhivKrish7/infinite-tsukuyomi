import type { BrokerIntegrationsResponse } from "./types";

export async function fetchBrokerIntegrations() {
  const response = await fetch("/api/integrations/brokers", {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Broker integrations request failed: ${response.status}`);
  }

  return response.json() as Promise<BrokerIntegrationsResponse>;
}
