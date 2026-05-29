import { EventEmitter } from "node:events";

type ClientProfile = {
  id: string;
  login: string;
  name: string;
  platformId: "nebulafx" | "squidfx";
  broker: "NebulaFX" | "SquidMarkets";
};

export type RealtimeSimulationEvent =
  | {
      type: "deposit.created" | "withdrawal.created";
      id: string;
      tenantId: string;
      platformId: string;
      clientId: string;
      clientName: string;
      amount: number;
      currency: string;
      message: string;
      timestamp: string;
    }
  | {
      type: "trade.opened" | "trade.closed";
      id: string;
      tenantId: string;
      connectionId: string;
      platformId: string;
      broker: string;
      clientId: string;
      clientName: string;
      login: string;
      symbol: string;
      side: "BUY" | "SELL";
      volume: string;
      notional: number;
      pnl: string;
      timestamp: string;
    }
  | {
      type: "price.tick";
      tenantId: string;
      connectionId: string;
      platformId: string;
      broker: string;
      symbol: string;
      bid: string;
      ask: string;
      spread: string;
      timestamp: string;
    }
  | {
      type: "client.presence";
      id: string;
      tenantId: string;
      platformId: string;
      clientId: string;
      clientName: string;
      status: "online" | "offline";
      message: string;
      timestamp: string;
    }
  | {
      type: "kyc.submitted";
      id: string;
      tenantId: string;
      platformId: string;
      clientId: string;
      clientName: string;
      documentType: string;
      message: string;
      timestamp: string;
    }
  | {
      type: "notification.created";
      id: string;
      tenantId: string;
      platformId?: string;
      severity: "info" | "warning" | "critical" | "success";
      title: string;
      message: string;
      timestamp: string;
    };

type TenantRuntime = {
  intervals: ReturnType<typeof setInterval>[];
  consumers: number;
  stopTimer?: ReturnType<typeof setTimeout>;
};

const symbols = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "US30"];

const basePrices: Record<string, number> = {
  EURUSD: 1.0842,
  GBPUSD: 1.2718,
  USDJPY: 156.42,
  XAUUSD: 2370.25,
  BTCUSD: 68420.5,
  US30: 39120.2
};

const clients: ClientProfile[] = [
  { id: "NX-10482", login: "10482", name: "Marcus Reid", platformId: "nebulafx", broker: "NebulaFX" },
  { id: "NX-09921", login: "09921", name: "Liam Torres", platformId: "nebulafx", broker: "NebulaFX" },
  { id: "NX-11001", login: "11001", name: "Aiko Yamamoto", platformId: "nebulafx", broker: "NebulaFX" },
  { id: "SQ-00214", login: "214", name: "Priya Kapoor", platformId: "squidfx", broker: "SquidMarkets" },
  { id: "SQ-00177", login: "177", name: "Chloe Martin", platformId: "squidfx", broker: "SquidMarkets" },
  { id: "SQ-00388", login: "388", name: "Sophia Muller", platformId: "squidfx", broker: "SquidMarkets" }
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
    message: "Open exposure is approaching the sandbox threshold."
  },
  {
    severity: "info",
    title: "Broker sync completed",
    message: "Accounts, balances, trades, and cashier transactions are current."
  },
  {
    severity: "critical",
    title: "KYC review needed",
    message: "A high-value withdrawal is waiting for compliance review."
  }
] satisfies Array<Pick<Extract<RealtimeSimulationEvent, { type: "notification.created" }>, "severity" | "title" | "message">>;

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function eventId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now() {
  return new Date().toISOString();
}

function money(value: number) {
  return Math.round(value / 50) * 50;
}

function brokerConnectionId(platformId: string) {
  return platformId === "nebulafx" ? "sandbox-nebulafx" : "sandbox-squidmarkets";
}

export class RealtimeSimulationEngine {
  private readonly emitter = new EventEmitter();
  private readonly tenants = new Map<string, TenantRuntime>();

  attachTenant(tenantId: string) {
    const runtime = this.ensureTenant(tenantId);
    runtime.consumers += 1;
    if (runtime.stopTimer) {
      clearTimeout(runtime.stopTimer);
      runtime.stopTimer = undefined;
    }

    return () => {
      runtime.consumers = Math.max(0, runtime.consumers - 1);
      if (runtime.consumers > 0 || runtime.stopTimer) return;

      runtime.stopTimer = setTimeout(() => {
        if (runtime.consumers > 0) return;
        runtime.intervals.forEach((interval) => clearInterval(interval));
        this.tenants.delete(tenantId);
      }, 15000);
    };
  }

  subscribe(tenantId: string, handler: (event: RealtimeSimulationEvent) => void | Promise<void>) {
    const listener = (event: RealtimeSimulationEvent) => {
      if (tenantId === "*" || event.tenantId === tenantId) void handler(event);
    };

    this.emitter.on("event", listener);
    return () => this.emitter.off("event", listener);
  }

  publish(event: RealtimeSimulationEvent) {
    this.emitter.emit("event", event);
  }

  private ensureTenant(tenantId: string) {
    const existing = this.tenants.get(tenantId);
    if (existing) return existing;

    const runtime: TenantRuntime = {
      consumers: 0,
      intervals: [
        setInterval(() => this.publish(this.createPriceTick(tenantId)), 1400),
        setInterval(() => this.publish(this.createTradeEvent(tenantId)), 3600),
        setInterval(() => this.publish(this.createCashierEvent(tenantId)), 5200),
        setInterval(() => this.publish(this.createPresenceEvent(tenantId)), 6800),
        setInterval(() => this.publish(this.createKycEvent(tenantId)), 9200),
        setInterval(() => this.publish(this.createNotificationEvent(tenantId)), 11800)
      ]
    };

    this.tenants.set(tenantId, runtime);
    queueMicrotask(() => this.publish(this.createNotificationEvent(tenantId, "Realtime simulation online")));
    return runtime;
  }

  private createCashierEvent(tenantId: string): RealtimeSimulationEvent {
    const client = randomItem(clients);
    const isDeposit = Math.random() > 0.42;
    const amount = money(isDeposit ? 1200 + Math.random() * 48000 : 500 + Math.random() * 18000);
    const type = isDeposit ? "deposit.created" : "withdrawal.created";

    return {
      type,
      id: eventId(isDeposit ? "dep" : "wd"),
      tenantId,
      platformId: client.platformId,
      clientId: client.id,
      clientName: client.name,
      amount,
      currency: "USD",
      message: `${client.name} ${isDeposit ? "deposited" : "requested withdrawal of"} $${amount.toLocaleString()}`,
      timestamp: now()
    };
  }

  private createTradeEvent(tenantId: string): RealtimeSimulationEvent {
    const client = randomItem(clients);
    const symbol = randomItem(symbols);
    const opened = Math.random() > 0.38;
    const volume = Math.max(0.1, Math.random() * 2.6);

    return {
      type: opened ? "trade.opened" : "trade.closed",
      id: eventId(opened ? "trade-open" : "trade-close"),
      tenantId,
      connectionId: brokerConnectionId(client.platformId),
      platformId: client.platformId,
      broker: client.broker,
      clientId: client.id,
      clientName: client.name,
      login: client.login,
      symbol,
      side: Math.random() > 0.5 ? "BUY" : "SELL",
      volume: volume.toFixed(2),
      notional: Math.round(volume * 100000),
      pnl: (Math.random() * 2600 - 900).toFixed(2),
      timestamp: now()
    };
  }

  private createPriceTick(tenantId: string): RealtimeSimulationEvent {
    const client = randomItem(clients);
    const symbol = randomItem(symbols);
    const base = basePrices[symbol];
    const spread = symbol === "BTCUSD" ? 12.5 : symbol === "US30" ? 2.4 : symbol === "XAUUSD" ? 0.23 : 0.00018;
    const decimals = symbol.endsWith("JPY") ? 3 : symbol === "BTCUSD" || symbol === "US30" || symbol === "XAUUSD" ? 2 : 5;
    const bid = base + Math.sin(Date.now() / 1700) * base * 0.0006 + (Math.random() - 0.5) * base * 0.00035;

    return {
      type: "price.tick",
      tenantId,
      connectionId: brokerConnectionId(client.platformId),
      platformId: client.platformId,
      broker: client.broker,
      symbol,
      bid: bid.toFixed(decimals),
      ask: (bid + spread).toFixed(decimals),
      spread: spread.toFixed(decimals),
      timestamp: now()
    };
  }

  private createPresenceEvent(tenantId: string): RealtimeSimulationEvent {
    const client = randomItem(clients);
    const status = Math.random() > 0.45 ? "online" : "offline";

    return {
      type: "client.presence",
      id: eventId("presence"),
      tenantId,
      platformId: client.platformId,
      clientId: client.id,
      clientName: client.name,
      status,
      message: `${client.name} is now ${status}`,
      timestamp: now()
    };
  }

  private createKycEvent(tenantId: string): RealtimeSimulationEvent {
    const client = randomItem(clients);
    const documentType = randomItem(["passport", "proof of address", "source of funds", "national ID"]);

    return {
      type: "kyc.submitted",
      id: eventId("kyc"),
      tenantId,
      platformId: client.platformId,
      clientId: client.id,
      clientName: client.name,
      documentType,
      message: `${client.name} submitted ${documentType} for KYC review`,
      timestamp: now()
    };
  }

  private createNotificationEvent(tenantId: string, title?: string): RealtimeSimulationEvent {
    const template = randomItem(notificationTemplates);
    const client = randomItem(clients);

    return {
      type: "notification.created",
      id: eventId("note"),
      tenantId,
      platformId: client.platformId,
      severity: template.severity,
      title: title ?? template.title,
      message: template.message,
      timestamp: now()
    };
  }
}

export class RealtimeWebSocketServer {
  private readonly clients = new Map<
    string,
    {
      tenantId: string;
      send: (payload: string) => void | Promise<void>;
      close?: () => void | Promise<void>;
    }
  >();

  private unsubscribe?: () => void;

  constructor(private readonly engine: RealtimeSimulationEngine) {}

  registerClient(input: {
    id: string;
    tenantId: string;
    send: (payload: string) => void | Promise<void>;
    close?: () => void | Promise<void>;
  }) {
    this.start();
    const releaseTenant = this.engine.attachTenant(input.tenantId);
    this.clients.set(input.id, input);

    return () => {
      this.clients.delete(input.id);
      releaseTenant();
    };
  }

  private start() {
    if (this.unsubscribe) return;

    this.unsubscribe = this.engine.subscribe("*", async (event) => {
      await Promise.all(
        Array.from(this.clients.values())
          .filter((client) => client.tenantId === event.tenantId)
          .map((client) => client.send(JSON.stringify(event)))
      );
    });
  }

  async stop() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    await Promise.all(Array.from(this.clients.values()).map((client) => client.close?.()));
    this.clients.clear();
  }
}

const globalForRealtime = globalThis as typeof globalThis & {
  realtimeSimulationEngine?: RealtimeSimulationEngine;
  realtimeWebSocketServer?: RealtimeWebSocketServer;
};

export const realtimeSimulationEngine =
  globalForRealtime.realtimeSimulationEngine ?? new RealtimeSimulationEngine();
globalForRealtime.realtimeSimulationEngine = realtimeSimulationEngine;

export const realtimeWebSocketServer =
  globalForRealtime.realtimeWebSocketServer ?? new RealtimeWebSocketServer(realtimeSimulationEngine);
globalForRealtime.realtimeWebSocketServer = realtimeWebSocketServer;
