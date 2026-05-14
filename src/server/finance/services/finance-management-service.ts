import {
  FinanceApprovalStatus,
  FinanceApprovalStep,
  Prisma,
  SuspiciousFlagSeverity,
  TransactionStatus,
  TransactionType,
  WalletStatus,
  WalletType
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { financeFeeEngine } from "../fees/fee-engine";
import { registerPaymentGateways } from "../gateways/register-payment-gateways";
import { paymentGatewayRegistry } from "../core/registry";
import { transactionRiskEngine } from "../risk/risk-engine";

type ListTransactionsInput = {
  tenantId: string;
  q?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  page: number;
  pageSize: number;
};

type CreateFinanceTransactionInput = {
  tenantId: string;
  actorId: string;
  clientId: string;
  walletId?: string;
  gatewayConnectionId?: string;
  type: Extract<TransactionType, "DEPOSIT" | "WITHDRAWAL">;
  amount: string;
  currency: string;
  method?: string;
  reference?: string;
};

type DecideTransactionInput = {
  tenantId: string;
  actorId: string;
  transactionId: string;
  decision: Extract<FinanceApprovalStatus, "APPROVED" | "REJECTED">;
  comment?: string;
};

type FlagTransactionInput = {
  tenantId: string;
  actorId: string;
  transactionId: string;
  severity: SuspiciousFlagSeverity;
  ruleCode: string;
  reason: string;
};

const transactionInclude = {
  client: { select: { id: true, name: true, email: true, riskLevel: true } },
  wallet: { select: { id: true, type: true, status: true, currency: true, availableBalance: true } },
  gatewayConnection: { select: { id: true, key: true, displayName: true, provider: true, status: true } },
  approvals: { include: { reviewer: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
  fees: true,
  suspiciousFlags: { orderBy: { createdAt: "desc" } }
} satisfies Prisma.TransactionInclude;

export class FinanceManagementService {
  constructor() {
    registerPaymentGateways();
  }

  async getOverview(tenantId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [
      depositTotals,
      withdrawalTotals,
      pendingApprovals,
      openFlags,
      wallets,
      transactions,
      ledgerEntries,
      fees,
      gateways,
      suspiciousFlags
    ] = await prisma.$transaction([
      prisma.transaction.aggregate({
        where: { tenantId, type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED, requestedAt: { gte: since } },
        _sum: { amount: true, feeAmount: true }
      }),
      prisma.transaction.aggregate({
        where: { tenantId, type: TransactionType.WITHDRAWAL, status: TransactionStatus.COMPLETED, requestedAt: { gte: since } },
        _sum: { amount: true, feeAmount: true }
      }),
      prisma.financeApproval.count({ where: { tenantId, status: FinanceApprovalStatus.PENDING } }),
      prisma.suspiciousTransactionFlag.count({ where: { tenantId, status: { in: ["OPEN", "IN_REVIEW"] } } }),
      prisma.wallet.findMany({
        where: { tenantId },
        include: { client: { select: { id: true, name: true, email: true } } },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        take: 10
      }),
      prisma.transaction.findMany({
        where: { tenantId },
        include: transactionInclude,
        orderBy: { requestedAt: "desc" },
        take: 12
      }),
      prisma.ledgerEntry.findMany({
        where: { tenantId },
        include: {
          wallet: { select: { id: true, type: true, currency: true } },
          transaction: { select: { id: true, type: true, status: true, reference: true } }
        },
        orderBy: { occurredAt: "desc" },
        take: 12
      }),
      prisma.financeFee.findMany({
        where: { tenantId },
        include: { transaction: { select: { id: true, type: true, reference: true, client: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 8
      }),
      prisma.paymentGatewayConnection.findMany({
        where: { tenantId },
        orderBy: [{ status: "asc" }, { displayName: "asc" }]
      }),
      prisma.suspiciousTransactionFlag.findMany({
        where: { tenantId },
        include: { transaction: { include: { client: { select: { id: true, name: true, email: true } } } }, reviewedBy: true },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

    return {
      metrics: {
        deposits30d: depositTotals._sum.amount ?? "0",
        withdrawals30d: withdrawalTotals._sum.amount ?? "0",
        fees30d: new Prisma.Decimal(depositTotals._sum.feeAmount ?? 0)
          .plus(withdrawalTotals._sum.feeAmount ?? 0)
          .toFixed(2),
        pendingApprovals,
        openFlags
      },
      wallets,
      transactions,
      ledgerEntries,
      fees,
      gateways,
      gatewayAdapters: paymentGatewayRegistry.list(),
      suspiciousFlags
    };
  }

  async listTransactions(input: ListTransactionsInput) {
    const where: Prisma.TransactionWhereInput = {
      tenantId: input.tenantId,
      ...(input.type ? { type: input.type } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.q
        ? {
            OR: [
              { reference: { contains: input.q, mode: "insensitive" } },
              { gatewayReference: { contains: input.q, mode: "insensitive" } },
              { client: { name: { contains: input.q, mode: "insensitive" } } },
              { client: { email: { contains: input.q, mode: "insensitive" } } }
            ]
          }
        : {})
    };

    const [items, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        include: transactionInclude,
        orderBy: { requestedAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize
      }),
      prisma.transaction.count({ where })
    ]);

    return {
      items,
      meta: {
        total,
        page: input.page,
        pageSize: input.pageSize,
        pageCount: Math.max(Math.ceil(total / input.pageSize), 1)
      }
    };
  }

  async createTransaction(input: CreateFinanceTransactionInput) {
    const client = await prisma.client.findFirstOrThrow({
      where: { id: input.clientId, tenantId: input.tenantId }
    });
    const wallet = input.walletId
      ? await prisma.wallet.findFirstOrThrow({ where: { id: input.walletId, tenantId: input.tenantId } })
      : await this.getOrCreateClientWallet(input.tenantId, input.clientId, input.currency);

    const recentWithdrawalCount = await prisma.transaction.count({
      where: {
        tenantId: input.tenantId,
        clientId: input.clientId,
        type: TransactionType.WITHDRAWAL,
        requestedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });
    const fees = financeFeeEngine.quote(input);
    const feeTotal = fees.reduce((total, fee) => total.plus(fee.amount), new Prisma.Decimal(0));
    const amount = new Prisma.Decimal(input.amount);
    const netAmount =
      input.type === TransactionType.DEPOSIT ? amount.minus(feeTotal).toFixed(2) : amount.plus(feeTotal).toFixed(2);
    const risk = transactionRiskEngine.assess({
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      clientRiskLevel: client.riskLevel,
      recentWithdrawalCount,
      method: input.method
    });

    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId: input.tenantId,
          clientId: input.clientId,
          walletId: wallet.id,
          gatewayConnectionId: input.gatewayConnectionId,
          requestedById: input.actorId,
          type: input.type,
          status: TransactionStatus.PENDING,
          amount: input.amount,
          feeAmount: feeTotal.toFixed(2),
          netAmount,
          currency: input.currency,
          method: input.method,
          reference: input.reference ?? `FIN-${Date.now()}`,
          riskScore: risk.score,
          suspicious: risk.suspicious,
          riskReason: risk.reason,
          approvals: {
            create: {
              tenantId: input.tenantId,
              step: risk.suspicious ? FinanceApprovalStep.RISK_REVIEW : FinanceApprovalStep.FINANCE_REVIEW
            }
          },
          fees: fees.length
            ? {
                create: fees.map((fee) => ({
                  tenant: { connect: { id: input.tenantId } },
                  type: fee.type,
                  name: fee.name,
                  amount: fee.amount,
                  currency: fee.currency,
                  ruleSnapshot: fee.ruleSnapshot as Prisma.InputJsonValue
                }))
              }
            : undefined,
          suspiciousFlags: risk.suspicious
            ? {
                create: {
                  tenantId: input.tenantId,
                  severity: risk.severity,
                  ruleCode: risk.ruleCode,
                  reason: risk.reason
                }
              }
            : undefined
        },
        include: transactionInclude
      });

      return transaction;
    });
  }

  async decideTransaction(input: DecideTransactionInput) {
    const transaction = await prisma.transaction.findFirstOrThrow({
      where: { id: input.transactionId, tenantId: input.tenantId },
      include: { wallet: true, approvals: { where: { status: FinanceApprovalStatus.PENDING }, take: 1 } }
    });

    if (input.decision === FinanceApprovalStatus.REJECTED) {
      return prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.REJECTED,
          processedById: input.actorId,
          processedAt: new Date(),
          approvals: {
            updateMany: {
              where: { status: FinanceApprovalStatus.PENDING },
              data: {
                status: FinanceApprovalStatus.REJECTED,
                reviewerId: input.actorId,
                comment: input.comment,
                decidedAt: new Date()
              }
            }
          }
        },
        include: transactionInclude
      });
    }

    if (!transaction.wallet) {
      throw new Error("Transaction must be attached to a wallet before approval");
    }

    const amount = new Prisma.Decimal(transaction.netAmount);
    const isCredit = transaction.type === TransactionType.DEPOSIT;
    const balanceAfter = isCredit
      ? new Prisma.Decimal(transaction.wallet.ledgerBalance).plus(amount)
      : new Prisma.Decimal(transaction.wallet.ledgerBalance).minus(amount);

    if (!isCredit && new Prisma.Decimal(transaction.wallet.availableBalance).lessThan(amount)) {
      throw new Error("Wallet has insufficient available balance");
    }

    return prisma.$transaction(async (tx) => {
      await tx.financeApproval.updateMany({
        where: { transactionId: transaction.id, status: FinanceApprovalStatus.PENDING },
        data: {
          status: FinanceApprovalStatus.APPROVED,
          reviewerId: input.actorId,
          comment: input.comment,
          decidedAt: new Date()
        }
      });

      await tx.wallet.update({
        where: { id: transaction.walletId! },
        data: {
          ledgerBalance: balanceAfter.toFixed(2),
          availableBalance: balanceAfter.toFixed(2),
          lifetimeDeposits: isCredit ? { increment: transaction.amount } : undefined,
          lifetimeWithdrawals: isCredit ? undefined : { increment: transaction.amount }
        }
      });

      await tx.ledgerEntry.create({
        data: {
          tenantId: input.tenantId,
          walletId: transaction.walletId!,
          transactionId: transaction.id,
          direction: isCredit ? "CREDIT" : "DEBIT",
          entryType: transaction.type,
          amount: amount.toFixed(2),
          currency: transaction.currency,
          balanceAfter: balanceAfter.toFixed(2),
          reference: transaction.reference
        }
      });

      return tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          processedById: input.actorId,
          processedAt: new Date()
        },
        include: transactionInclude
      });
    });
  }

  async flagTransaction(input: FlagTransactionInput) {
    return prisma.suspiciousTransactionFlag.create({
      data: {
        tenantId: input.tenantId,
        transactionId: input.transactionId,
        reviewedById: input.actorId,
        severity: input.severity,
        ruleCode: input.ruleCode,
        reason: input.reason
      }
    }).then(async (flag) => {
      await prisma.transaction.update({
        where: { id: input.transactionId },
        data: { suspicious: true, riskReason: input.reason, riskScore: { increment: 15 } }
      });

      return flag;
    });
  }

  async listGateways(tenantId: string) {
    const connections = await prisma.paymentGatewayConnection.findMany({
      where: { tenantId },
      orderBy: { displayName: "asc" }
    });

    return {
      adapters: paymentGatewayRegistry.list(),
      connections
    };
  }

  private async getOrCreateClientWallet(tenantId: string, clientId: string, currency: string) {
    const wallet = await prisma.wallet.findFirst({
      where: { tenantId, clientId, currency, type: WalletType.CLIENT, status: WalletStatus.ACTIVE }
    });
    if (wallet) return wallet;

    return prisma.wallet.create({
      data: {
        tenantId,
        clientId,
        currency,
        type: WalletType.CLIENT,
        status: WalletStatus.ACTIVE
      }
    });
  }
}

export const financeManagementService = new FinanceManagementService();
