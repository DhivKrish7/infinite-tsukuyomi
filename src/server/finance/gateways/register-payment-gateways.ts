import { paymentGatewayRegistry } from "../core/registry";
import { mockBankwireAdapter } from "./mock-bankwire/adapter";

let registered = false;

export function registerPaymentGateways() {
  if (registered) return;

  paymentGatewayRegistry.register(mockBankwireAdapter);
  registered = true;
}
