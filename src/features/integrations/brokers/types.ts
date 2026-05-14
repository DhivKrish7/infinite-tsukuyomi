export type BrokerAdapterSummary = {
  key: string;
  displayName: string;
  vendor: string;
  version: string;
  capabilities: string[];
};

export type BrokerConnectionSummary = {
  id: string;
  adapterKey: string;
  displayName: string;
  status: string;
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
