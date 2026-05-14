import type { ScreeningProviderAdapter, ScreeningProviderMetadata } from "./screening-adapter";

export class ScreeningProviderRegistry {
  private readonly adapters = new Map<string, ScreeningProviderAdapter>();

  register(adapter: ScreeningProviderAdapter) {
    if (this.adapters.has(adapter.key)) {
      throw new Error(`Screening provider already registered: ${adapter.key}`);
    }

    this.adapters.set(adapter.key, adapter);
  }

  list(): ScreeningProviderMetadata[] {
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
      throw new Error(`Screening provider not found: ${key}`);
    }

    return adapter;
  }
}

export const screeningProviderRegistry = new ScreeningProviderRegistry();
