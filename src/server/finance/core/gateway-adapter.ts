import type {
  GatewayHealth,
  GatewayPaymentRequest,
  GatewayPaymentResult,
  PaymentGatewayCapability,
  PaymentGatewayContext
} from "./domain";

export type PaymentGatewayAdapterMetadata = {
  key: string;
  displayName: string;
  provider: string;
  version: string;
  capabilities: PaymentGatewayCapability[];
};

export type PaymentGatewayAdapter = PaymentGatewayAdapterMetadata & {
  validateConfig: (input: {
    credentials: Record<string, unknown>;
    settings: Record<string, unknown>;
  }) => Promise<void> | void;
  healthCheck: (context: PaymentGatewayContext) => Promise<GatewayHealth>;
  initiatePayment: (
    context: PaymentGatewayContext,
    request: GatewayPaymentRequest
  ) => Promise<GatewayPaymentResult>;
  verifyWebhook?: (payload: unknown, signature?: string | null) => Promise<boolean> | boolean;
};
