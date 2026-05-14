import type { FinanceOverview } from "./types";

const now = Date.now();

export const demoFinanceOverview: FinanceOverview = {
  metrics: {
    deposits30d: "184250.00",
    withdrawals30d: "97240.00",
    fees30d: "1428.75",
    pendingApprovals: 7,
    openFlags: 3
  },
  wallets: [
    {
      id: "wallet-1",
      type: "CLIENT",
      status: "ACTIVE",
      currency: "USD",
      ledgerBalance: "48250.00",
      availableBalance: "46890.00",
      holdBalance: "1360.00",
      lifetimeDeposits: "128000.00",
      lifetimeWithdrawals: "79750.00",
      client: { id: "client-1", name: "Ari Sterling", email: "ari@example.com", riskLevel: "MEDIUM" }
    },
    {
      id: "wallet-2",
      type: "CLIENT",
      status: "FROZEN",
      currency: "USD",
      ledgerBalance: "27500.00",
      availableBalance: "0.00",
      holdBalance: "27500.00",
      lifetimeDeposits: "91000.00",
      lifetimeWithdrawals: "63500.00",
      client: { id: "client-2", name: "Maya Chen", email: "maya@example.com", riskLevel: "HIGH" }
    }
  ],
  transactions: [
    {
      id: "txn-1",
      type: "WITHDRAWAL",
      status: "PENDING",
      amount: "25000.00",
      feeAmount: "150.00",
      netAmount: "25150.00",
      currency: "USD",
      method: "bank_wire",
      reference: "FIN-88412",
      riskScore: 82,
      suspicious: true,
      riskReason: "large value movement, high client risk profile",
      requestedAt: new Date(now - 20 * 60 * 1000).toISOString(),
      client: { id: "client-2", name: "Maya Chen", email: "maya@example.com", riskLevel: "HIGH" },
      approvals: [{ id: "approval-1", step: "RISK_REVIEW", status: "PENDING" }],
      fees: [],
      suspiciousFlags: []
    },
    {
      id: "txn-2",
      type: "DEPOSIT",
      status: "COMPLETED",
      amount: "18000.00",
      feeAmount: "63.00",
      netAmount: "17937.00",
      currency: "USD",
      method: "card",
      reference: "FIN-88400",
      gatewayReference: "BW-DEPOSIT-FIN-88400",
      riskScore: 30,
      suspicious: false,
      requestedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(now - 2.8 * 60 * 60 * 1000).toISOString(),
      client: { id: "client-1", name: "Ari Sterling", email: "ari@example.com", riskLevel: "MEDIUM" },
      approvals: [{ id: "approval-2", step: "FINANCE_REVIEW", status: "APPROVED" }],
      fees: [],
      suspiciousFlags: []
    }
  ],
  ledgerEntries: [
    {
      id: "ledger-1",
      direction: "CREDIT",
      entryType: "DEPOSIT",
      amount: "17937.00",
      currency: "USD",
      balanceAfter: "46890.00",
      reference: "FIN-88400",
      occurredAt: new Date(now - 2.7 * 60 * 60 * 1000).toISOString(),
      wallet: { id: "wallet-1", type: "CLIENT", currency: "USD" },
      transaction: { id: "txn-2", type: "DEPOSIT", status: "COMPLETED", reference: "FIN-88400" }
    }
  ],
  fees: [
    {
      id: "fee-1",
      type: "DEPOSIT",
      name: "deposit card processing",
      amount: "63.00",
      currency: "USD",
      createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      transaction: { id: "txn-2", type: "DEPOSIT", reference: "FIN-88400", client: { name: "Ari Sterling" } }
    }
  ],
  gateways: [
    {
      id: "gateway-1",
      key: "mock-bankwire",
      displayName: "Mock Bankwire Rail",
      provider: "Internal Treasury",
      status: "CONNECTED",
      settlementCurrency: "USD",
      lastHealthCheckAt: new Date(now - 4 * 60 * 1000).toISOString()
    }
  ],
  gatewayAdapters: [
    {
      key: "mock-bankwire",
      displayName: "Mock Bankwire Rail",
      provider: "Internal Treasury",
      version: "2026.05",
      capabilities: ["deposits.create", "withdrawals.create", "webhooks.verify", "settlements.sync"]
    }
  ],
  suspiciousFlags: [
    {
      id: "flag-1",
      status: "OPEN",
      severity: "HIGH",
      ruleCode: "TXN_RISK_THRESHOLD",
      reason: "large value movement, high client risk profile",
      createdAt: new Date(now - 21 * 60 * 1000).toISOString(),
      transaction: {
        id: "txn-1",
        type: "WITHDRAWAL",
        status: "PENDING",
        amount: "25000.00",
        feeAmount: "150.00",
        netAmount: "25150.00",
        currency: "USD",
        riskScore: 82,
        suspicious: true,
        requestedAt: new Date(now - 20 * 60 * 1000).toISOString(),
        client: { id: "client-2", name: "Maya Chen", email: "maya@example.com" }
      }
    }
  ]
};
