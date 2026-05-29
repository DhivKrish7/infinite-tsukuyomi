import type {
  BrokerAccountSnapshot,
  BrokerBalanceSubscription,
  BrokerCapability,
  BrokerConnectionContext,
  BrokerConnectionSession,
  BrokerHealth,
  BrokerPage,
  BrokerPriceSubscription,
  BrokerRealtimeEvent,
  BrokerTradeSnapshot,
  BrokerTransactionSnapshot
} from "./domain";

export type BrokerAdapterMetadata = {
  key: string;
  displayName: string;
  vendor: string;
  version: string;
  platformFamily: "mock" | "mt5" | "ctrader" | "dxtrade" | "crypto";
  capabilities: BrokerCapability[];
  productionReady?: boolean;
};

export type BrokerPricePublish = (event: BrokerRealtimeEvent) => Promise<void> | void;

export type BaseBrokerAdapter = BrokerAdapterMetadata & {
  validateConfig: (input: {
    credentials: Record<string, unknown>;
    settings: Record<string, unknown>;
  }) => Promise<void> | void;

  connect: (context: BrokerConnectionContext) => Promise<BrokerConnectionSession>;
  disconnect: (context: BrokerConnectionContext) => Promise<void>;
  syncClients: (context: BrokerConnectionContext, cursor?: string | null) => Promise<BrokerPage<BrokerAccountSnapshot>>;
  syncTrades: (context: BrokerConnectionContext, cursor?: string | null) => Promise<BrokerPage<BrokerTradeSnapshot>>;
  syncBalances: (context: BrokerConnectionContext, cursor?: string | null) => Promise<BrokerPage<BrokerAccountSnapshot>>;
  getHealth: (context: BrokerConnectionContext) => Promise<BrokerHealth>;
  subscribePrices: (
    context: BrokerConnectionContext,
    publish: BrokerPricePublish,
    symbols?: string[]
  ) => Promise<BrokerPriceSubscription>;

  syncTransactions?: (
    context: BrokerConnectionContext,
    cursor?: string | null
  ) => Promise<BrokerPage<BrokerTransactionSnapshot>>;
  subscribeBalances?: (
    context: BrokerConnectionContext,
    publish: BrokerPricePublish
  ) => Promise<BrokerBalanceSubscription>;
};

export type BrokerAdapter = BaseBrokerAdapter;
