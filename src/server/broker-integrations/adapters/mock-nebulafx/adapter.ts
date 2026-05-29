import type { BrokerAdapter } from "../../core/adapter";

const now = () => new Date().toISOString();
const defaultSymbols = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"];

async function simulateLatency(settings: Record<string, unknown>) {
  const latencyMs = Number(settings.latencyMs ?? 180);
  await new Promise((resolve) => setTimeout(resolve, Math.min(Math.max(latencyMs, 25), 1200)));
}

function isOutage(settings: Record<string, unknown>) {
  return Boolean(settings.simulateOutage);
}

export const mockNebulafxAdapter: BrokerAdapter = {
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
  ],
  validateConfig({ credentials }) {
    if (!credentials.apiKey) {
      throw new Error("NebulaFX mock adapter requires apiKey");
    }
  },
  async connect(context) {
    await simulateLatency(context.settings);
    if (isOutage(context.settings)) throw new Error("NebulaFX sandbox outage is active");

    return {
      connected: true,
      sessionId: `nebula-${context.connectionId}`,
      connectedAt: now(),
      message: "NebulaFX sandbox session established"
    };
  },
  async disconnect() {
    return Promise.resolve();
  },
  async getHealth(context) {
    await simulateLatency(context.settings);

    if (isOutage(context.settings)) {
      return { ok: false, latencyMs: 1200, message: "Sandbox outage active for NebulaFX" };
    }

    return { ok: true, latencyMs: Number(context.settings.latencyMs ?? 180), message: "NebulaFX sandbox bridge reachable" };
  },
  async syncClients(context, cursor) {
    await simulateLatency(context.settings);
    if (isOutage(context.settings)) throw new Error("NebulaFX sandbox outage is active");
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalAccountId: "NX-10482",
          externalClientId: "client-marcus",
          clientEmail: "marcus.reid@nexusdemo.local",
          clientName: "Marcus Reid",
          login: "10482",
          currency: "USD",
          balance: "84200.00",
          equity: "88320.00",
          margin: "12000.00",
          freeMargin: "76320.00",
          credit: "0.00",
          updatedAt: now()
        },
        {
          externalAccountId: "NX-11001",
          externalClientId: "client-aiko",
          clientEmail: "aiko.yamamoto@nexusdemo.local",
          clientName: "Aiko Yamamoto",
          login: "11001",
          currency: "USD",
          balance: "220000.00",
          equity: "238400.00",
          margin: "44000.00",
          freeMargin: "194400.00",
          credit: "0.00",
          updatedAt: now()
        }
      ]
    };
  },
  async syncBalances(context, cursor) {
    return mockNebulafxAdapter.syncClients(context, cursor);
  },
  async syncTrades(context, cursor) {
    await simulateLatency(context.settings);
    if (isOutage(context.settings)) throw new Error("NebulaFX sandbox outage is active");
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalTradeId: "NX-T-9001",
          accountLogin: "10482",
          symbol: "EURUSD",
          side: "BUY",
          volume: "1.20",
          openPrice: "1.084200",
          closePrice: null,
          pnl: "4120.00",
          openedAt: now()
        },
        {
          externalTradeId: "NX-T-9002",
          accountLogin: "11001",
          symbol: "GBPUSD",
          side: "SELL",
          volume: "2.40",
          openPrice: "1.271800",
          closePrice: null,
          pnl: "18400.00",
          openedAt: new Date(Date.now() - 1000 * 60 * 34).toISOString()
        }
      ]
    };
  },
  async syncTransactions(context, cursor) {
    await simulateLatency(context.settings);
    if (isOutage(context.settings)) throw new Error("NebulaFX sandbox outage is active");
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalTransactionId: "NX-D-8821",
          externalClientId: "client-marcus",
          clientEmail: "marcus.reid@nexusdemo.local",
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: "5000.00",
          currency: "USD",
          method: "Bank Wire",
          requestedAt: now(),
          processedAt: now()
        },
        {
          externalTransactionId: "NX-W-8822",
          externalClientId: "client-aiko",
          clientEmail: "aiko.yamamoto@nexusdemo.local",
          type: "WITHDRAWAL",
          status: "PENDING",
          amount: "12000.00",
          currency: "USD",
          method: "Bank Wire",
          requestedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
        }
      ]
    };
  },
  async subscribePrices(context, publish, symbols = defaultSymbols) {
    const interval = setInterval(() => {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)] ?? "EURUSD";
      const base = symbol === "XAUUSD" ? 2370.25 : symbol.endsWith("JPY") ? 156.42 : 1.0842;
      const bid = base + (Math.random() - 0.5) * base * 0.001;
      const spread = symbol === "XAUUSD" ? 0.23 : 0.00018;

      void publish({
        type: "price.tick",
        tenantId: context.tenantId,
        connectionId: context.connectionId,
        platformId: context.platformId,
        broker: "NebulaFX",
        symbol,
        bid: bid.toFixed(symbol.endsWith("JPY") ? 3 : symbol === "XAUUSD" ? 2 : 5),
        ask: (bid + spread).toFixed(symbol.endsWith("JPY") ? 3 : symbol === "XAUUSD" ? 2 : 5),
        spread: spread.toFixed(symbol === "XAUUSD" ? 2 : 5),
        timestamp: now()
      });
    }, 2500);

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
          externalAccountId: "NX-10482",
          externalClientId: "client-marcus",
          clientEmail: "marcus.reid@nexusdemo.local",
          clientName: "Marcus Reid",
          login: "10482",
          currency: "USD",
          balance: "84200.00",
          equity: String(88320 + Math.round(Math.random() * 1000)),
          margin: "12000.00",
          freeMargin: "76320.00",
          credit: "0.00",
          updatedAt: now()
        }
      });
    }, 5000);

    return {
      unsubscribe: () => clearInterval(interval)
    };
  }
};

export const adapter = mockNebulafxAdapter;
