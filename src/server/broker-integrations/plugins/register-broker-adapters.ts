import { mockNebulafxAdapter } from "../adapters/mock-nebulafx/adapter";
import { mockSquidfxAdapter } from "../adapters/mock-squidfx/adapter";
import { brokerAdapterRegistry } from "../core/registry";

let registered = false;

export function registerBrokerAdapters() {
  if (registered) return brokerAdapterRegistry;

  brokerAdapterRegistry.register(mockNebulafxAdapter);
  brokerAdapterRegistry.register(mockSquidfxAdapter);
  registered = true;

  return brokerAdapterRegistry;
}
