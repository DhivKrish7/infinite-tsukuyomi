export type BrokerAdapterSummary = {
  key: string;
  displayName: string;
  vendor: string;
  version: string;
  platformFamily?: string;
  productionReady?: boolean;
  capabilities: string[];
};

export type BrokerConnectionSummary = {
  id: string;
  adapterKey: string;
  displayName: string;
  status: string;
  settings?: Record<string, unknown> | null;
  lastHeartbeatAt?: string | null;
  lastAccountSyncAt?: string | null;
  lastTradeSyncAt?: string | null;
  lastTransactionSyncAt?: string | null;
  platform: {
    id: string;
    name: string;
    type: string;
    isConnected: boolean;
  };
  syncRuns: Array<{
    id: string;
    type: string;
    status: string;
    recordsRead: number;
    recordsUpserted: number;
    createdAt: string;
  }>;
};

export type BrokerIntegrationsResponse = {
  adapters: BrokerAdapterSummary[];
  connections: BrokerConnectionSummary[];
};

export type BrokerRealtimeEvent = {
  type: string;
  timestamp?: string;
  tenantId?: string;
  broker?: string;
  symbol?: string;
  bid?: string;
  ask?: string;
  spread?: string;
  title?: string;
  message?: string;
  severity?: "info" | "warning" | "critical" | "success";
  login?: string;
  side?: "BUY" | "SELL";
  volume?: string;
  pnl?: string;
};
