import { ReportType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const reportDefinitions = [
  {
    key: "customer-summary",
    name: "Customer Summary",
    type: ReportType.CUSTOMER,
    description: "Read-only customer status, ownership, onboarding, and activity counts.",
    columns: ["name", "email", "status", "onboardingStage", "kycStatus", "riskLevel", "assignedTo", "accounts", "transactions"],
    exportConfig: { formats: ["CSV", "XLSX", "JSON"], delivery: "manual", scheduler: false }
  },
  {
    key: "trade-ledger",
    name: "Trade Ledger",
    type: ReportType.TRADE,
    description: "Read-only trade history across existing trading accounts.",
    columns: ["ticket", "client", "login", "symbol", "side", "volume", "openPrice", "closePrice", "pnl", "openedAt", "closedAt"],
    exportConfig: { formats: ["CSV", "XLSX", "JSON"], delivery: "manual", scheduler: false }
  },
  {
    key: "transaction-ledger",
    name: "Transaction Ledger",
    type: ReportType.TRANSACTION,
    description: "Read-only deposits, withdrawals, transfers, fees, and transaction state.",
    columns: ["reference", "client", "type", "status", "amount", "feeAmount", "netAmount", "currency", "requestedAt", "processedAt"],
    exportConfig: { formats: ["CSV", "XLSX", "JSON"], delivery: "manual", scheduler: false }
  }
] as const;

type ReportViewerType = "CUSTOMER" | "TRADE" | "TRANSACTION";

function serializeDecimal(value: unknown) {
  return Number(value ?? 0);
}

export class ReportService {
  listDefinitions() {
    return { items: reportDefinitions };
  }

  async listHistory(tenantId: string) {
    const items = await prisma.reportHistory.findMany({
      where: { tenantId },
      include: {
        definition: { select: { id: true, key: true, name: true } },
        requestedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return { items };
  }

  async getViewer(tenantId: string, type: ReportViewerType) {
    if (type === "CUSTOMER") return this.getCustomerReport(tenantId);
    if (type === "TRADE") return this.getTradeReport(tenantId);
    return this.getTransactionReport(tenantId);
  }

  private async getCustomerReport(tenantId: string) {
    const items = await prisma.client.findMany({
      where: { tenantId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        _count: { select: { accounts: true, transactions: true, notes: true, communications: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return {
      type: "CUSTOMER",
      columns: reportDefinitions[0].columns,
      exportConfig: reportDefinitions[0].exportConfig,
      items
    };
  }

  private async getTradeReport(tenantId: string) {
    const trades = await prisma.trade.findMany({
      where: { account: { client: { tenantId } } },
      include: {
        account: {
          select: {
            id: true,
            login: true,
            currency: true,
            client: { select: { id: true, name: true, email: true } },
            platform: { select: { id: true, name: true, type: true } }
          }
        }
      },
      orderBy: { openedAt: "desc" },
      take: 100
    });

    return {
      type: "TRADE",
      columns: reportDefinitions[1].columns,
      exportConfig: reportDefinitions[1].exportConfig,
      items: trades.map((trade) => ({
        ...trade,
        volume: serializeDecimal(trade.volume),
        openPrice: serializeDecimal(trade.openPrice),
        closePrice: trade.closePrice == null ? null : serializeDecimal(trade.closePrice),
        pnl: serializeDecimal(trade.pnl)
      }))
    };
  }

  private async getTransactionReport(tenantId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { tenantId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
        processedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { requestedAt: "desc" },
      take: 100
    });

    return {
      type: "TRANSACTION",
      columns: reportDefinitions[2].columns,
      exportConfig: reportDefinitions[2].exportConfig,
      items: transactions.map((transaction) => ({
        ...transaction,
        amount: serializeDecimal(transaction.amount),
        feeAmount: serializeDecimal(transaction.feeAmount),
        netAmount: serializeDecimal(transaction.netAmount)
      }))
    };
  }
}

export const reportService = new ReportService();
