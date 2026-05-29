import type { BrokerSyncType } from "@prisma/client";

export type BrokerCapability =
  | "connection.lifecycle"
  | "accounts.sync"
  | "trades.sync"
  | "transactions.sync"
  | "balances.realtime"
  | "prices.realtime"
  | "sandbox.controls"
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

export type BrokerConnectionSession = {
  connected: boolean;
  sessionId?: string;
  connectedAt: string;
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
  tenantId?: string;
  connectionId: string;
  platformId: string;
  account: BrokerAccountSnapshot;
};

export type BrokerRealtimePriceEvent = {
  type: "price.tick";
  tenantId?: string;
  connectionId: string;
  platformId: string;
  broker: string;
  symbol: string;
  bid: string;
  ask: string;
  spread: string;
  timestamp: string;
};

export type BrokerRealtimeTradeEvent = {
  type: "trade.opened" | "trade.closed";
  tenantId?: string;
  connectionId: string;
  platformId: string;
  broker: string;
  login: string;
  symbol: string;
  side: "BUY" | "SELL";
  volume: string;
  pnl: string;
  timestamp: string;
};

export type BrokerRealtimeNotificationEvent = {
  type: "notification.created";
  tenantId?: string;
  connectionId?: string;
  platformId?: string;
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  message: string;
  timestamp: string;
};

export type BrokerRealtimeEvent =
  | BrokerRealtimeBalanceEvent
  | BrokerRealtimePriceEvent
  | BrokerRealtimeTradeEvent
  | BrokerRealtimeNotificationEvent;

export type BrokerBalanceSubscription = {
  unsubscribe: () => Promise<void> | void;
};

export type BrokerPriceSubscription = {
  symbols: string[];
  unsubscribe: () => Promise<void> | void;
};
