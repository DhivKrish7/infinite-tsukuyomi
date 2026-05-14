import type { PaymentGatewayAdapter, PaymentGatewayAdapterMetadata } from "./gateway-adapter";

export class PaymentGatewayRegistry {
  private readonly adapters = new Map<string, PaymentGatewayAdapter>();

  register(adapter: PaymentGatewayAdapter) {
    if (this.adapters.has(adapter.key)) {
      throw new Error(`Payment gateway adapter already registered: ${adapter.key}`);
    }

    this.adapters.set(adapter.key, adapter);
  }

  list(): PaymentGatewayAdapterMetadata[] {
    return Array.from(this.adapters.values()).map((adapter) => ({
      key: adapter.key,
      displayName: adapter.displayName,
      provider: adapter.provider,
      version: adapter.version,
      capabilities: adapter.capabilities
    }));
  }

  get(key: string) {
    const adapter = this.adapters.get(key);
    if (!adapter) {
      throw new Error(`Payment gateway adapter not found: ${key}`);
    }

    return adapter;
  }
}

export const paymentGatewayRegistry = new PaymentGatewayRegistry();
