import type { BrokerAdapter, BrokerAdapterMetadata } from "./adapter";
import { brokerAdapterRegistry, type BrokerAdapterRegistry } from "./registry";

type BrokerAdapterFactory = () => Promise<BrokerAdapter>;

type BrokerAdapterModule = {
  adapter: BrokerAdapter;
};

type BrokerAdapterManifestEntry = BrokerAdapterMetadata & {
  status: "available" | "planned";
  load?: BrokerAdapterFactory;
};

async function loadAdapterModule(importer: () => Promise<BrokerAdapterModule>) {
  const adapterModule = await importer();
  return adapterModule.adapter;
}

export const brokerAdapterManifest: BrokerAdapterManifestEntry[] = [
  {
    key: "mock.nebulafx",
    displayName: "NebulaFX",
    vendor: "Nexus Labs",
    version: "1.2.0",
    platformFamily: "mock",
    productionReady: false,
    status: "available",
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
    load: () => loadAdapterModule(() => import("../adapters/mock-nebulafx/adapter"))
  },
  {
    key: "mock.squidmarkets",
    displayName: "SquidMarkets",
    vendor: "Nexus Labs",
    version: "1.2.0",
    platformFamily: "mock",
    productionReady: false,
    status: "available",
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
    load: () => loadAdapterModule(() => import("../adapters/mock-squidfx/adapter"))
  },
  {
    key: "mt5",
    displayName: "MetaTrader 5",
    vendor: "MetaQuotes",
    version: "planned",
    platformFamily: "mt5",
    productionReady: false,
    status: "planned",
    capabilities: ["connection.lifecycle", "accounts.sync", "trades.sync", "prices.realtime", "health.check"]
  },
  {
    key: "ctrader",
    displayName: "cTrader",
    vendor: "Spotware",
    version: "planned",
    platformFamily: "ctrader",
    productionReady: false,
    status: "planned",
    capabilities: ["connection.lifecycle", "accounts.sync", "trades.sync", "prices.realtime", "health.check"]
  },
  {
    key: "dxtrade",
    displayName: "DXtrade",
    vendor: "Devexperts",
    version: "planned",
    platformFamily: "dxtrade",
    productionReady: false,
    status: "planned",
    capabilities: ["connection.lifecycle", "accounts.sync", "trades.sync", "prices.realtime", "health.check"]
  },
  {
    key: "binance",
    displayName: "Binance",
    vendor: "Binance",
    version: "planned",
    platformFamily: "crypto",
    productionReady: false,
    status: "planned",
    capabilities: ["connection.lifecycle", "accounts.sync", "trades.sync", "prices.realtime", "health.check"]
  },
  {
    key: "bybit",
    displayName: "Bybit",
    vendor: "Bybit",
    version: "planned",
    platformFamily: "crypto",
    productionReady: false,
    status: "planned",
    capabilities: ["connection.lifecycle", "accounts.sync", "trades.sync", "prices.realtime", "health.check"]
  }
];

export class BrokerAdapterLoader {
  private loaded = false;
  private loading?: Promise<BrokerAdapterRegistry>;

  constructor(private readonly registry: BrokerAdapterRegistry = brokerAdapterRegistry) {}

  listManifest() {
    return brokerAdapterManifest.map((entry) => ({
      key: entry.key,
      displayName: entry.displayName,
      vendor: entry.vendor,
      version: entry.version,
      platformFamily: entry.platformFamily,
      productionReady: entry.productionReady,
      capabilities: entry.capabilities,
      status: entry.status
    }));
  }

  async loadAvailable() {
    if (this.loaded) return this.registry;
    if (this.loading) return this.loading;

    this.loading = (async () => {
      for (const entry of brokerAdapterManifest) {
        if (entry.status !== "available" || !entry.load) continue;
        if (this.registry.has(entry.key)) continue;
        this.registry.register(await entry.load());
      }

      this.loaded = true;
      return this.registry;
    })();

    return this.loading;
  }

  async load(adapterKey: string) {
    await this.loadAvailable();
    return this.registry.get(adapterKey);
  }
}

export const brokerAdapterLoader = new BrokerAdapterLoader();
