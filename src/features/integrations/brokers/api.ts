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

export async function runBrokerAction(
  connectionId: string,
  action: "enable" | "disable" | "reconnect" | "simulate_outage" | "clear_outage"
) {
  const response = await fetch(`/api/integrations/brokers/${connectionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action })
  });

  if (!response.ok) {
    throw new Error(`Broker action failed: ${response.status}`);
  }

  return response.json();
}

export async function testBrokerConnection(connectionId: string) {
  const response = await fetch(`/api/integrations/brokers/${connectionId}/health`, {
    method: "POST",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Broker health check failed: ${response.status}`);
  }

  return response.json();
}

export async function syncBrokerConnection(connectionId: string) {
  const response = await fetch(`/api/integrations/brokers/${connectionId}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ types: ["ACCOUNTS", "TRADES", "TRANSACTIONS"] })
  });

  if (!response.ok) {
    throw new Error(`Broker sync failed: ${response.status}`);
  }

  return response.json();
}
