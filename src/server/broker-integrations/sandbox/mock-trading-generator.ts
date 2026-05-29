import type {
  BrokerRealtimeEvent,
  BrokerRealtimeNotificationEvent,
  BrokerRealtimePriceEvent,
  BrokerRealtimeTradeEvent
} from "../core/domain";

const symbols = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "US30"];

const basePrices: Record<string, number> = {
  EURUSD: 1.0842,
  GBPUSD: 1.2718,
  USDJPY: 156.42,
  XAUUSD: 2370.25,
  BTCUSD: 68420.5,
  US30: 39120.2
};

const brokerProfiles = [
  {
    broker: "NebulaFX",
    connectionId: "sandbox-nebulafx",
    platformId: "sandbox-platform-nebulafx",
    logins: ["10482", "11001", "09921"]
  },
  {
    broker: "SquidMarkets",
    connectionId: "sandbox-squidmarkets",
    platformId: "sandbox-platform-squidmarkets",
    logins: ["214", "388", "177"]
  }
];

const notificationTemplates = [
  {
    severity: "success",
    title: "Deposit settled",
    message: "Client funding posted to the trading wallet."
  },
  {
    severity: "warning",
    title: "Margin warning",
    message: "Open exposure is approaching the sandbox risk threshold."
  },
  {
    severity: "info",
    title: "Broker sync completed",
    message: "Accounts, balances, trades, and cashier transactions are current."
  },
  {
    severity: "critical",
    title: "Broker outage simulated",
    message: "Health checks will degrade until the outage toggle is cleared."
  }
] satisfies Array<Omit<BrokerRealtimeNotificationEvent, "type" | "timestamp">>;

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function fixed(value: number, decimals = 5) {
  return value.toFixed(decimals);
}

export function createMockPriceTick(seed = Date.now(), tenantId?: string): BrokerRealtimePriceEvent {
  const profile = randomItem(brokerProfiles);
  const symbol = randomItem(symbols);
  const base = basePrices[symbol];
  const wave = Math.sin(seed / 1600) * base * 0.0007;
  const noise = (Math.random() - 0.5) * base * 0.00035;
  const bid = base + wave + noise;
  const spread = symbol === "XAUUSD" ? 0.23 : symbol === "BTCUSD" ? 12.5 : 0.00018;

  return {
    type: "price.tick",
    tenantId,
    connectionId: profile.connectionId,
    platformId: profile.platformId,
    broker: profile.broker,
    symbol,
    bid: fixed(bid, symbol.endsWith("JPY") ? 3 : symbol === "BTCUSD" || symbol === "US30" ? 2 : 5),
    ask: fixed(bid + spread, symbol.endsWith("JPY") ? 3 : symbol === "BTCUSD" || symbol === "US30" ? 2 : 5),
    spread: fixed(spread, symbol === "BTCUSD" || symbol === "US30" ? 2 : 5),
    timestamp: new Date().toISOString()
  };
}

export function createMockTradeEvent(tenantId?: string): BrokerRealtimeTradeEvent {
  const profile = randomItem(brokerProfiles);
  const symbol = randomItem(symbols);
  const pnl = (Math.random() * 1400 - 520).toFixed(2);

  return {
    type: Math.random() > 0.35 ? "trade.opened" : "trade.closed",
    tenantId,
    connectionId: profile.connectionId,
    platformId: profile.platformId,
    broker: profile.broker,
    login: randomItem(profile.logins),
    symbol,
    side: Math.random() > 0.5 ? "BUY" : "SELL",
    volume: (Math.random() * 2.2 + 0.1).toFixed(2),
    pnl,
    timestamp: new Date().toISOString()
  };
}

export function createMockNotificationEvent(tenantId?: string): BrokerRealtimeNotificationEvent {
  const template = randomItem(notificationTemplates);

  return {
    type: "notification.created",
    tenantId,
    ...template,
    timestamp: new Date().toISOString()
  };
}

export function createMockRealtimeEvent(tenantId?: string): BrokerRealtimeEvent {
  const roll = Math.random();

  if (roll > 0.82) return createMockNotificationEvent(tenantId);
  if (roll > 0.62) return createMockTradeEvent(tenantId);
  return createMockPriceTick(Date.now(), tenantId);
}
