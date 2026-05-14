import type { BrokerIntegrationsResponse } from "./types";

export const demoBrokerIntegrations: BrokerIntegrationsResponse = {
  adapters: [
    {
      key: "mock.nebulafx",
      displayName: "Mock NebulFX",
      vendor: "Nexus Labs",
      version: "1.0.0",
      capabilities: ["accounts.sync", "trades.sync", "transactions.sync", "balances.realtime"]
    },
    {
      key: "mock.squidfx",
      displayName: "Mock SquidFX",
      vendor: "Nexus Labs",
      version: "1.0.0",
      capabilities: ["accounts.sync", "trades.sync", "transactions.sync", "balances.realtime"]
    }
  ],
  connections: [
    {
      id: "demo-connection-nebulafx",
      adapterKey: "mock.nebulafx",
      displayName: "NebulFX Production",
      status: "CONNECTED",
      lastHeartbeatAt: new Date().toISOString(),
      lastAccountSyncAt: new Date(Date.now() - 120000).toISOString(),
      lastTradeSyncAt: new Date(Date.now() - 180000).toISOString(),
      lastTransactionSyncAt: new Date(Date.now() - 240000).toISOString(),
      platform: {
        id: "demo-platform-nebulafx",
        name: "NebulFX",
        type: "MT5 + MT4",
        isConnected: true
      },
      syncRuns: [
        {
          id: "sync-1",
          type: "ACCOUNTS",
          status: "SUCCEEDED",
          recordsRead: 2,
          recordsUpserted: 2,
          createdAt: new Date(Date.now() - 120000).toISOString()
        }
      ]
    }
  ]
};
