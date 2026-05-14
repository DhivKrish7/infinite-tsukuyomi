export type FinanceMetricSet = {
  deposits30d: string | number;
  withdrawals30d: string | number;
  fees30d: string | number;
  pendingApprovals: number;
  openFlags: number;
};

export type FinanceClientRef = {
  id: string;
  name: string;
  email: string;
  riskLevel?: string;
};

export type FinanceWallet = {
  id: string;
  type: string;
  status: string;
  currency: string;
  ledgerBalance: string | number;
  availableBalance: string | number;
  holdBalance: string | number;
  lifetimeDeposits: string | number;
  lifetimeWithdrawals: string | number;
  client?: FinanceClientRef | null;
};

export type FinanceTransaction = {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "FEE" | "COMMISSION";
  status: string;
  amount: string | number;
  feeAmount: string | number;
  netAmount: string | number;
  currency: string;
  method?: string | null;
  reference?: string | null;
  gatewayReference?: string | null;
  riskScore: number;
  suspicious: boolean;
  riskReason?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  client: FinanceClientRef;
  approvals?: FinanceApproval[];
  fees?: FinanceFee[];
  suspiciousFlags?: SuspiciousFlag[];
  gatewayConnection?: PaymentGatewayConnection | null;
};

export type FinanceApproval = {
  id: string;
  step: string;
  status: string;
  comment?: string | null;
  decidedAt?: string | null;
  reviewer?: { id: string; name: string; email: string } | null;
};

export type LedgerEntry = {
  id: string;
  direction: "DEBIT" | "CREDIT";
  entryType: string;
  amount: string | number;
  currency: string;
  balanceAfter: string | number;
  reference?: string | null;
  occurredAt: string;
  wallet?: Pick<FinanceWallet, "id" | "type" | "currency">;
  transaction?: Pick<FinanceTransaction, "id" | "type" | "status" | "reference"> | null;
};

export type FinanceFee = {
  id: string;
  type: string;
  name: string;
  amount: string | number;
  currency: string;
  createdAt: string;
  transaction?: {
    id: string;
    type: string;
    reference?: string | null;
    client?: { name: string } | null;
  } | null;
};

export type PaymentGatewayConnection = {
  id: string;
  key: string;
  displayName: string;
  provider: string;
  status: string;
  settlementCurrency?: string;
  lastHealthCheckAt?: string | null;
};

export type PaymentGatewayAdapter = {
  key: string;
  displayName: string;
  provider: string;
  version: string;
  capabilities: string[];
};

export type SuspiciousFlag = {
  id: string;
  status: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ruleCode: string;
  reason: string;
  createdAt: string;
  transaction?: FinanceTransaction;
};

export type FinanceOverview = {
  metrics: FinanceMetricSet;
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
  ledgerEntries: LedgerEntry[];
  fees: FinanceFee[];
  gateways: PaymentGatewayConnection[];
  gatewayAdapters: PaymentGatewayAdapter[];
  suspiciousFlags: SuspiciousFlag[];
};
