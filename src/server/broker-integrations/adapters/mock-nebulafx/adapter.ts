import type { BrokerAdapter } from "../../core/adapter";

const now = () => new Date().toISOString();

export const mockNebulafxAdapter: BrokerAdapter = {
  key: "mock.nebulafx",
  displayName: "Mock NebulFX",
  vendor: "Nexus Labs",
  version: "1.0.0",
  capabilities: ["accounts.sync", "trades.sync", "transactions.sync", "balances.realtime", "health.check"],
  validateConfig({ credentials }) {
    if (!credentials.apiKey) {
      throw new Error("NebulFX mock adapter requires apiKey");
    }
  },
  async healthCheck() {
    return { ok: true, latencyMs: 42, message: "Mock NebulFX bridge reachable" };
  },
  async fetchAccounts(_, cursor) {
    if (cursor === "done") return { items: [], nextCursor: null };

    return {
      nextCursor: "done",
      items: [
        {
          externalAccountId: "NX-10482",
          externalClientId: "client-marcus",
          clientEmail: "marcus@email.com",
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
          clientEmail: "aiko@email.com",
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
  async fetchTrades(_, cursor) {
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
          externalTransactionId: "NX-D-8821",
          externalClientId: "client-marcus",
          clientEmail: "marcus@email.com",
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: "5000.00",
          currency: "USD",
          method: "Bank Wire",
          requestedAt: now(),
          processedAt: now()
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
          externalAccountId: "NX-10482",
          externalClientId: "client-marcus",
          clientEmail: "marcus@email.com",
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
