import type { BrokerRealtimeEvent } from "./domain";
import { brokerEventBus } from "./events";

export type BrokerWebSocketLike = {
  readyState?: number;
  send: (payload: string) => void | Promise<void>;
  close?: () => void | Promise<void>;
};

export type BrokerWebSocketClient = {
  id: string;
  tenantId: string;
  send: (event: BrokerRealtimeEvent) => void | Promise<void>;
  close?: () => void | Promise<void>;
};

export class BrokerRealtimeGateway {
  private readonly clients = new Map<string, BrokerWebSocketClient>();
  private unsubscribeFromBus?: () => void;

  start() {
    if (this.unsubscribeFromBus) return;

    this.unsubscribeFromBus = brokerEventBus.subscribe(async (event) => {
      await this.broadcast(event);
    });
  }

  registerClient(client: BrokerWebSocketClient) {
    this.start();
    this.clients.set(client.id, client);

    return () => {
      this.clients.delete(client.id);
    };
  }

  registerSocket(input: { id: string; tenantId: string; socket: BrokerWebSocketLike }) {
    return this.registerClient({
      id: input.id,
      tenantId: input.tenantId,
      send: (event) => input.socket.send(JSON.stringify(event)),
      close: input.socket.close ? () => input.socket.close?.() : undefined
    });
  }

  async emit(event: BrokerRealtimeEvent) {
    await brokerEventBus.publish(event);
  }

  async broadcast(event: BrokerRealtimeEvent) {
    await Promise.all(
      Array.from(this.clients.values())
        .filter((client) => !event.tenantId || client.tenantId === event.tenantId)
        .map((client) => client.send(event))
    );
  }

  async stop() {
    this.unsubscribeFromBus?.();
    this.unsubscribeFromBus = undefined;
    await Promise.all(Array.from(this.clients.values()).map((client) => client.close?.()));
    this.clients.clear();
  }
}

export const brokerRealtimeGateway = new BrokerRealtimeGateway();
