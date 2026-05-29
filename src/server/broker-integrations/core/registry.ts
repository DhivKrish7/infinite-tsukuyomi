import type { BrokerAdapter } from "./adapter";
import { BrokerAdapterNotFoundError } from "./errors";

export class BrokerAdapterRegistry {
  private readonly adapters = new Map<string, BrokerAdapter>();

  register(adapter: BrokerAdapter) {
    if (this.adapters.has(adapter.key)) {
      throw new Error(`Duplicate broker adapter key: ${adapter.key}`);
    }

    this.adapters.set(adapter.key, adapter);
  }

  has(adapterKey: string) {
    return this.adapters.has(adapterKey);
  }

  get(adapterKey: string) {
    const adapter = this.adapters.get(adapterKey);
    if (!adapter) throw new BrokerAdapterNotFoundError(adapterKey);
    return adapter;
  }

  list() {
    return Array.from(this.adapters.values()).map(
      ({ key, displayName, vendor, version, platformFamily, capabilities, productionReady }) => ({
        key,
        displayName,
        vendor,
        version,
        platformFamily,
        productionReady: Boolean(productionReady),
        capabilities
      })
    );
  }
}

export const brokerAdapterRegistry = new BrokerAdapterRegistry();
