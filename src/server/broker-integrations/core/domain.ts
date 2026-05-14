import type { BrokerSyncType } from "@prisma/client";

export type BrokerCapability =
  | "accounts.sync"
  | "trades.sync"
  | "transactions.sync"
  | "balances.realtime"
  | "health.check";

export type BrokerConnectionContext = {
  tenantId: string;
  connectionId: string;
  platformId: string;
  adapterKey: string;
  credentials: Record<string, unknown>;
  settings: Record<string, unknown>;
  cursors: Partial<Record<BrokerSyncType, string | null>>;
};

export type BrokerPage<T> = {
  items: T[];
  nextCursor?: string | null;
};

export type BrokerHealth = {
  ok: boolean;
  latencyMs?: number;
  message?: string;
};

export type BrokerAccountSnapshot = {
  externalAccountId: string;
  externalClientId?: string;
  clientEmail: string;
  clientName: string;
  login: string;
  currency: string;
  balance: string;
  equity: string;
  margin: string;
  freeMargin?: string;
  credit?: string;
  updatedAt: string;
};

export type BrokerTradeSnapshot = {
  externalTradeId: string;
  accountLogin: string;
  symbol: string;
  side: "BUY" | "SELL";
  volume: string;
  openPrice: string;
  closePrice?: string | null;
  pnl: string;
  openedAt: string;
  closedAt?: string | null;
};

export type BrokerTransactionSnapshot = {
  externalTransactionId: string;
  externalClientId?: string;
  clientEmail: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "FEE" | "COMMISSION";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REJECTED" | "CANCELLED";
  amount: string;
  currency: string;
  method?: string;
  requestedAt: string;
  processedAt?: string | null;
};

export type BrokerRealtimeBalanceEvent = {
  type: "balance.updated";
  connectionId: string;
  platformId: string;
  account: BrokerAccountSnapshot;
};

export type BrokerRealtimeEvent = BrokerRealtimeBalanceEvent;

export type BrokerBalanceSubscription = {
  unsubscribe: () => Promise<void> | void;
};
