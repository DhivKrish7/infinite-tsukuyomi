import type { BrokerRealtimeEvent } from "./domain";

type BrokerEventHandler<T extends BrokerRealtimeEvent = BrokerRealtimeEvent> = (event: T) => void | Promise<void>;

export type BrokerEventSubscriptionOptions = {
  tenantId?: string;
  eventTypes?: BrokerRealtimeEvent["type"][];
};

type BrokerEventListener = {
  handler: BrokerEventHandler;
  options: BrokerEventSubscriptionOptions;
};

export class BrokerIntegrationEventBus {
  private readonly listeners = new Set<BrokerEventListener>();

  subscribe(handler: BrokerEventHandler, options: BrokerEventSubscriptionOptions = {}) {
    const listener = { handler, options };
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async publish(event: BrokerRealtimeEvent) {
    await Promise.all(
      Array.from(this.listeners)
        .filter((listener) => this.matches(listener.options, event))
        .map((listener) => listener.handler(event))
    );
  }

  private matches(options: BrokerEventSubscriptionOptions, event: BrokerRealtimeEvent) {
    if (options.tenantId && event.tenantId && event.tenantId !== options.tenantId) return false;
    if (options.eventTypes?.length && !options.eventTypes.includes(event.type)) return false;
    return true;
  }
}

export const brokerEventBus = new BrokerIntegrationEventBus();
