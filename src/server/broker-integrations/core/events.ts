import type { BrokerRealtimeEvent } from "./domain";

type BrokerEventHandler<T extends BrokerRealtimeEvent = BrokerRealtimeEvent> = (event: T) => void | Promise<void>;

export class BrokerIntegrationEventBus {
  private readonly listeners = new Set<BrokerEventHandler>();

  subscribe(handler: BrokerEventHandler) {
    this.listeners.add(handler);

    return () => {
      this.listeners.delete(handler);
    };
  }

  async publish(event: BrokerRealtimeEvent) {
    await Promise.all(Array.from(this.listeners).map((handler) => handler(event)));
  }
}

export const brokerEventBus = new BrokerIntegrationEventBus();
