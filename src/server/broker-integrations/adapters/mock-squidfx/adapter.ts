import type { BrokerAdapter } from "../../core/adapter";

const now = () => new Date().toISOString();
const defaultSymbols = ["XAUUSD", "BTCUSD", "ETHUSD", "US30"];

async function simulateLatency(settings: Record<string, unknown>) {
  const latencyMs = Number(settings.latencyMs ?? 240);
  await new Promise((resolve) => setTimeout(resolve, Math.min(Math.max(latencyMs, 25), 1200)));
}

function isOutage(settings: Record<string, unknown>) {
  return Boolean(settings.simulateOutage);
}

export const mockSquidfxAdapter: BrokerAdapter = {
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
  ],
  validateConfig({ credentials }) {
    if (!credentials.clientId) {
      throw new Error("SquidMarkets mock adapter requires clientId");
    }
  },
  async connect(context) {
    await simulateLatency(context.settings);
    if (isOutage(context.settings)) throw new Error("SquidMarkets sandbox outage is active");

    return {
      connected: true,
      sessionId: `squid-${context.connectionId}`,
      connectedAt: now(),
      message: "SquidMarkets sandbox session established"
    };
  },
  async disconnect() {
    return Promise.resolve();
  },
  async getHealth(context) {
    await simulateLatency(context.settings);

    if (isOutage(context.settings)) {
      return { ok: false, latencyMs: 1200, message: "Sandbox outage active for SquidMarkets" };
    }

    return { ok: true, latencyMs: Number(context.settings.latencyMs ?? 240), message: "SquidMarkets sandbox stream ready" };
  },
  async syncClients(context, cursor) {
    await simulateLatency(context.settings);
    if (isOutage(context.settings)) throw new Error("SquidMarkets sandbox outage is active");
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalAccountId: "SQ-00214",
          externalClientId: "client-priya",
          clientEmail: "priya.kapoor@nexusdemo.local",
          clientName: "Priya Kapoor",
          login: "214",
          currency: "USD",
          balance: "32000.00",
          equity: "33830.00",
          margin: "6200.00",
          freeMargin: "27630.00",
          credit: "0.00",
          updatedAt: now()
        },
        {
          externalAccountId: "SQ-00388",
          externalClientId: "client-sophia",
          clientEmail: "sophia.muller@nexusdemo.local",
          clientName: "Sophia Muller",
          login: "388",
          currency: "USD",
          balance: "8900.00",
          equity: "8760.00",
          margin: "5100.00",
          freeMargin: "3660.00",
          credit: "0.00",
          updatedAt: now()
        }
      ]
    };
  },
  async syncBalances(context, cursor) {
    return mockSquidfxAdapter.syncClients(context, cursor);
  },
  async syncTrades(context, cursor) {
    await simulateLatency(context.settings);
    if (isOutage(context.settings)) throw new Error("SquidMarkets sandbox outage is active");
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalTradeId: "SQ-T-7001",
          accountLogin: "388",
          symbol: "XAUUSD",
          side: "SELL",
          volume: "0.50",
          openPrice: "2370.250000",
          closePrice: null,
          pnl: "-140.00",
          openedAt: now()
        },
        {
          externalTradeId: "SQ-T-7002",
          accountLogin: "214",
          symbol: "BTCUSD",
          side: "BUY",
          volume: "0.18",
          openPrice: "68420.500000",
          closePrice: null,
          pnl: "1830.00",
          openedAt: new Date(Date.now() - 1000 * 60 * 47).toISOString()
        }
      ]
    };
  },
  async syncTransactions(context, cursor) {
    await simulateLatency(context.settings);
    if (isOutage(context.settings)) throw new Error("SquidMarkets sandbox outage is active");
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalTransactionId: "SQ-W-8819",
          externalClientId: "client-priya",
          clientEmail: "priya.kapoor@nexusdemo.local",
          type: "WITHDRAWAL",
          status: "PENDING",
          amount: "800.00",
          currency: "USD",
          method: "Bank Wire",
          requestedAt: now()
        },
        {
          externalTransactionId: "SQ-D-8820",
          externalClientId: "client-sophia",
          clientEmail: "sophia.muller@nexusdemo.local",
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: "2500.00",
          currency: "USD",
          method: "Card",
          requestedAt: new Date(Date.now() - 1000 * 60 * 66).toISOString(),
          processedAt: new Date(Date.now() - 1000 * 60 * 63).toISOString()
        }
      ]
    };
  },
  async subscribePrices(context, publish, symbols = defaultSymbols) {
    const interval = setInterval(() => {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)] ?? "XAUUSD";
      const base = symbol === "BTCUSD" ? 68420.5 : symbol === "ETHUSD" ? 3720.25 : symbol === "US30" ? 39120.2 : 2370.25;
      const bid = base + (Math.random() - 0.5) * base * 0.0012;
      const spread = symbol === "BTCUSD" ? 12.5 : symbol === "ETHUSD" ? 1.8 : symbol === "US30" ? 2.4 : 0.23;

      void publish({
        type: "price.tick",
        tenantId: context.tenantId,
        connectionId: context.connectionId,
        platformId: context.platformId,
        broker: "SquidMarkets",
        symbol,
        bid: bid.toFixed(symbol === "XAUUSD" ? 2 : symbol.endsWith("USD") || symbol === "US30" ? 2 : 5),
        ask: (bid + spread).toFixed(symbol === "XAUUSD" ? 2 : symbol.endsWith("USD") || symbol === "US30" ? 2 : 5),
        spread: spread.toFixed(symbol === "XAUUSD" || symbol.endsWith("USD") || symbol === "US30" ? 2 : 5),
        timestamp: now()
      });
    }, 2800);

    return {
      symbols,
      unsubscribe: () => clearInterval(interval)
    };
  },
  async subscribeBalances(context, publish) {
    const interval = setInterval(() => {
      void publish({
        type: "balance.updated",
        tenantId: context.tenantId,
        connectionId: context.connectionId,
        platformId: context.platformId,
        account: {
          externalAccountId: "SQ-00214",
          externalClientId: "client-priya",
          clientEmail: "priya.kapoor@nexusdemo.local",
          clientName: "Priya Kapoor",
          login: "214",
          currency: "USD",
          balance: "32000.00",
          equity: String(33830 + Math.round(Math.random() * 600)),
          margin: "6200.00",
          freeMargin: "27630.00",
          credit: "0.00",
          updatedAt: now()
        }
      });
    }, 6000);

    return {
      unsubscribe: () => clearInterval(interval)
    };
  }
};

export const adapter = mockSquidfxAdapter;
