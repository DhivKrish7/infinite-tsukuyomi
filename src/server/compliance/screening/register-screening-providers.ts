import { screeningProviderRegistry } from "../core/registry";
import { mockWatchlistAdapter } from "./mock-watchlist/adapter";

let registered = false;

export function registerScreeningProviders() {
  if (registered) return;

  screeningProviderRegistry.register(mockWatchlistAdapter);
  registered = true;
}
