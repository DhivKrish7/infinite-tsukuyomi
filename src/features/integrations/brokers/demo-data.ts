import type { BrokerIntegrationsResponse } from "./types";

export const demoBrokerIntegrations: BrokerIntegrationsResponse = {
  adapters: [
    {
      key: "mock.nebulafx",
      displayName: "NebulaFX",
      vendor: "Nexus Labs",
      version: "1.2.0",
      platformFamily: "mock",
      productionReady: false,
      capabilities: [
        "connection.lifecycle",
        "accounts.sync",
        "trades.sync",
        "transactions.sync",
        "balances.realtime",
        "prices.realtime",
        "sandbox.controls",
        "health.check"
      ]
    },
    {
      key: "mock.squidmarkets",
      displayName: "SquidMarkets",
      vendor: "Nexus Labs",
      version: "1.2.0",
      platformFamily: "mock",
      productionReady: false,
      capabilities: [
        "connection.lifecycle",
        "accounts.sync",
        "trades.sync",
        "transactions.sync",
        "balances.realtime",
        "prices.realtime",
        "sandbox.controls",
        "health.check"
      ]
    }
  ],
  connections: [
    {
      id: "demo-connection-nebulafx",
      adapterKey: "mock.nebulafx",
      displayName: "NebulaFX Sandbox",
      status: "CONNECTED",
      settings: { latencyMs: 180, simulateOutage: false },
      lastHeartbeatAt: new Date().toISOString(),
      lastAccountSyncAt: new Date(Date.now() - 120000).toISOString(),
      lastTradeSyncAt: new Date(Date.now() - 180000).toISOString(),
      lastTransactionSyncAt: new Date(Date.now() - 240000).toISOString(),
      platform: {
        id: "demo-platform-nebulafx",
        name: "NebulaFX",
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
    },
    {
      id: "demo-connection-squidmarkets",
      adapterKey: "mock.squidmarkets",
      displayName: "SquidMarkets Sandbox",
      status: "CONNECTED",
      settings: { latencyMs: 240, simulateOutage: false },
      lastHeartbeatAt: new Date().toISOString(),
      lastAccountSyncAt: new Date(Date.now() - 180000).toISOString(),
      lastTradeSyncAt: new Date(Date.now() - 240000).toISOString(),
      lastTransactionSyncAt: new Date(Date.now() - 300000).toISOString(),
      platform: {
        id: "demo-platform-squidmarkets",
        name: "SquidMarkets",
        type: "cTrader",
        isConnected: true
      },
      syncRuns: [
        {
          id: "sync-2",
          type: "TRADES",
          status: "SUCCEEDED",
          recordsRead: 4,
          recordsUpserted: 4,
          createdAt: new Date(Date.now() - 240000).toISOString()
        }
      ]
    }
  ]
};
