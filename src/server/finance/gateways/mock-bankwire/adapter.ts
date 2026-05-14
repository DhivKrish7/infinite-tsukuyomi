import { PaymentGatewayStatus, TransactionStatus } from "@prisma/client";
import type { PaymentGatewayAdapter } from "../../core/gateway-adapter";

export const mockBankwireAdapter: PaymentGatewayAdapter = {
  key: "mock-bankwire",
  displayName: "Mock Bankwire Rail",
  provider: "Internal Treasury",
  version: "2026.05",
  capabilities: ["deposits.create", "withdrawals.create", "webhooks.verify", "settlements.sync"],
  validateConfig({ credentials }) {
    if (!credentials.accountReference) {
      throw new Error("Mock Bankwire requires accountReference credentials");
    }
  },
  async healthCheck() {
    return {
      ok: true,
      status: PaymentGatewayStatus.CONNECTED,
      latencyMs: 42,
      message: "Treasury sandbox reachable"
    };
  },
  async initiatePayment(_, request) {
    return {
      gatewayReference: `BW-${request.type}-${request.reference}`,
      status: request.type === "DEPOSIT" ? TransactionStatus.COMPLETED : TransactionStatus.PENDING,
      raw: {
        rail: "bankwire",
        method: request.method ?? "wire",
        transactionId: request.transactionId
      }
    };
  },
  verifyWebhook() {
    return true;
  }
};
