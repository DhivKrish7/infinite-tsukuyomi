import type {
  BrokerAccountSnapshot,
  BrokerBalanceSubscription,
  BrokerCapability,
  BrokerConnectionContext,
  BrokerHealth,
  BrokerPage,
  BrokerRealtimeEvent,
  BrokerTradeSnapshot,
  BrokerTransactionSnapshot
} from "./domain";

export type BrokerAdapterMetadata = {
  key: string;
  displayName: string;
  vendor: string;
  version: string;
  capabilities: BrokerCapability[];
};

export type BrokerAdapter = BrokerAdapterMetadata & {
  validateConfig: (input: {
    credentials: Record<string, unknown>;
    settings: Record<string, unknown>;
  }) => Promise<void> | void;
  healthCheck: (context: BrokerConnectionContext) => Promise<BrokerHealth>;
  fetchAccounts: (context: BrokerConnectionContext, cursor?: string | null) => Promise<BrokerPage<BrokerAccountSnapshot>>;
  fetchTrades: (context: BrokerConnectionContext, cursor?: string | null) => Promise<BrokerPage<BrokerTradeSnapshot>>;
  fetchTransactions: (
    context: BrokerConnectionContext,
    cursor?: string | null
  ) => Promise<BrokerPage<BrokerTransactionSnapshot>>;
  subscribeBalances?: (
    context: BrokerConnectionContext,
    publish: (event: BrokerRealtimeEvent) => Promise<void> | void
  ) => Promise<BrokerBalanceSubscription>;
};
