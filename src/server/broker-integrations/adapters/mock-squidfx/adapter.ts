import type { BrokerAdapter } from "../../core/adapter";

const now = () => new Date().toISOString();

export const mockSquidfxAdapter: BrokerAdapter = {
  key: "mock.squidfx",
  displayName: "Mock SquidFX",
  vendor: "Nexus Labs",
  version: "1.0.0",
  capabilities: ["accounts.sync", "trades.sync", "transactions.sync", "balances.realtime", "health.check"],
  validateConfig({ credentials }) {
    if (!credentials.clientId) {
      throw new Error("SquidFX mock adapter requires clientId");
    }
  },
  async healthCheck() {
    return { ok: true, latencyMs: 57, message: "Mock cTrader stream ready" };
  },
  async fetchAccounts(_, cursor) {
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalAccountId: "SQ-00214",
          externalClientId: "client-priya",
          clientEmail: "priya@email.com",
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
          clientEmail: "sophia@email.com",
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
  async fetchTrades(_, cursor) {
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
        }
      ]
    };
  },
  async fetchTransactions(_, cursor) {
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalTransactionId: "SQ-W-8819",
          externalClientId: "client-priya",
          clientEmail: "priya@email.com",
          type: "WITHDRAWAL",
          status: "PENDING",
          amount: "800.00",
          currency: "USD",
          method: "Bank Wire",
          requestedAt: now()
        }
      ]
    };
  },
  async subscribeBalances(context, publish) {
    const interval = setInterval(() => {
      void publish({
        type: "balance.updated",
        connectionId: context.connectionId,
        platformId: context.platformId,
        account: {
          externalAccountId: "SQ-00214",
          externalClientId: "client-priya",
          clientEmail: "priya@email.com",
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
