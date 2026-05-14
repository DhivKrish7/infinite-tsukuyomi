import type {
  FinanceFeeType,
  PaymentGatewayStatus,
  TransactionStatus,
  TransactionType
} from "@prisma/client";

export type MoneyInput = {
  amount: string;
  currency: string;
};

export type PaymentGatewayCapability =
  | "deposits.create"
  | "withdrawals.create"
  | "refunds.create"
  | "webhooks.verify"
  | "settlements.sync";

export type PaymentGatewayContext = {
  tenantId: string;
  connectionId: string;
  credentials: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export type GatewayHealth = {
  ok: boolean;
  status: PaymentGatewayStatus;
  latencyMs?: number;
  message?: string;
};

export type GatewayPaymentRequest = {
  clientId: string;
  transactionId: string;
  type: Extract<TransactionType, "DEPOSIT" | "WITHDRAWAL">;
  money: MoneyInput;
  reference: string;
  method?: string;
  metadata?: Record<string, unknown>;
};

export type GatewayPaymentResult = {
  gatewayReference: string;
  status: TransactionStatus;
  raw?: Record<string, unknown>;
};

export type FinanceFeeQuote = {
  type: FinanceFeeType;
  name: string;
  amount: string;
  currency: string;
  ruleSnapshot: Record<string, unknown>;
};

export type RiskAssessment = {
  score: number;
  suspicious: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ruleCode: string;
  reason: string;
};
