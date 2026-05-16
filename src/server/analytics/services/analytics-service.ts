import {
  BrokerConnectionStatus,
  ClientStatus,
  LeadStatus,
  OnboardingStage,
  Prisma,
  TransactionStatus,
  TransactionType
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export class AnalyticsService {
  async getOverview(tenantId: string) {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - 30);

    const [
      clientsTotal,
      activeClients,
      inactiveClients,
      suspendedClients,
      leadsTotal,
      convertedLeads,
      accountsAggregate,
      tradeAggregate,
      tradesCount,
      depositsAggregate,
      withdrawalsAggregate,
      feeAggregate,
      platforms,
      brokerConnections,
      leadStages,
      clientStages,
      recentTrades,
      recentTransactions
    ] = await prisma.$transaction([
      prisma.client.count({ where: { tenantId } }),
      prisma.client.count({ where: { tenantId, status: ClientStatus.ACTIVE } }),
      prisma.client.count({ where: { tenantId, status: ClientStatus.INACTIVE } }),
      prisma.client.count({ where: { tenantId, status: ClientStatus.SUSPENDED } }),
      prisma.lead.count({ where: { tenantId } }),
      prisma.lead.count({ where: { tenantId, status: LeadStatus.CONVERTED } }),
      prisma.tradingAccount.aggregate({
        where: { client: { tenantId } },
        _sum: { balance: true, equity: true, margin: true },
        _count: true
      }),
      prisma.trade.aggregate({
        where: { account: { client: { tenantId } }, openedAt: { gte: periodStart } },
        _sum: { volume: true, pnl: true }
      }),
      prisma.trade.count({ where: { account: { client: { tenantId } }, openedAt: { gte: periodStart } } }),
      prisma.transaction.aggregate({
        where: {
          tenantId,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          requestedAt: { gte: periodStart }
        },
        _sum: { amount: true, feeAmount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          tenantId,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.COMPLETED,
          requestedAt: { gte: periodStart }
        },
        _sum: { amount: true, feeAmount: true }
      }),
      prisma.financeFee.aggregate({
        where: { tenantId, createdAt: { gte: periodStart } },
        _sum: { amount: true }
      }),
      prisma.tradingPlatform.findMany({
        where: { tenantId },
        include: {
          _count: { select: { clients: true, accounts: true, brokerConnections: true } }
        },
        orderBy: { name: "asc" }
      }),
      prisma.brokerConnection.findMany({
        where: { tenantId },
        include: { platform: { select: { id: true, name: true, type: true } } },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.lead.groupBy({
        by: ["onboardingStage"],
        where: { tenantId },
        orderBy: { onboardingStage: "asc" },
        _count: { _all: true }
      }),
      prisma.client.groupBy({
        by: ["onboardingStage"],
        where: { tenantId },
        orderBy: { onboardingStage: "asc" },
        _count: { _all: true }
      }),
      prisma.trade.findMany({
        where: { account: { client: { tenantId } }, openedAt: { gte: periodStart } },
        select: { openedAt: true, volume: true, pnl: true },
        orderBy: { openedAt: "asc" },
        take: 250
      }),
      prisma.transaction.findMany({
        where: { tenantId, requestedAt: { gte: periodStart } },
        select: { requestedAt: true, type: true, amount: true, feeAmount: true, status: true },
        orderBy: { requestedAt: "asc" },
        take: 250
      })
    ]);

    const aum = decimal(accountsAggregate._sum.equity ?? accountsAggregate._sum.balance);
    const balance = decimal(accountsAggregate._sum.balance);
    const margin = decimal(accountsAggregate._sum.margin);
    const depositAmount = decimal(depositsAggregate._sum.amount);
    const withdrawalAmount = decimal(withdrawalsAggregate._sum.amount);
    const revenue = decimal(feeAggregate._sum.amount)
      .plus(depositsAggregate._sum.feeAmount ?? 0)
      .plus(withdrawalsAggregate._sum.feeAmount ?? 0);
    const retentionRate = clientsTotal ? ((activeClients / clientsTotal) * 100).toFixed(1) : "0.0";
    const conversionRate = leadsTotal ? ((convertedLeads / leadsTotal) * 100).toFixed(1) : "0.0";

    return {
      realtime: {
        activeClients,
        openAccounts: accountsAggregate._count,
        connectedBrokers: brokerConnections.filter((connection) => connection.status === BrokerConnectionStatus.CONNECTED).length,
        pendingWithdrawals: await prisma.transaction.count({
          where: { tenantId, type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING }
        }),
        lastUpdatedAt: now.toISOString()
      },
      metrics: {
        aum: aum.toFixed(2),
        balance: balance.toFixed(2),
        margin: margin.toFixed(2),
        tradingVolume: decimal(tradeAggregate._sum.volume).toFixed(2),
        pnl: decimal(tradeAggregate._sum.pnl).toFixed(2),
        tradesCount,
        revenue: revenue.toFixed(2),
        deposits: depositAmount.toFixed(2),
        withdrawals: withdrawalAmount.toFixed(2),
        netFlow: depositAmount.minus(withdrawalAmount).toFixed(2),
        retentionRate,
        churnRisk: inactiveClients + suspendedClients,
        conversionRate
      },
      aumSeries: makeAumSeries(aum),
      tradingActivity: makeTradingSeries(recentTrades),
      revenueSeries: makeRevenueSeries(recentTransactions),
      retention: [
        { segment: "Active", clients: activeClients },
        { segment: "Inactive", clients: inactiveClients },
        { segment: "Suspended", clients: suspendedClients }
      ],
      conversionFunnel: buildFunnel(leadStages, clientStages),
      brokerPerformance: platforms.map((platform) => {
        const connections = brokerConnections.filter((connection) => connection.platformId === platform.id);
        const connected = connections.filter((connection) => connection.status === BrokerConnectionStatus.CONNECTED).length;

        return {
          id: platform.id,
          name: platform.name,
          type: platform.type,
          clients: platform._count.clients,
          accounts: platform._count.accounts,
          connections: connections.length,
          connected,
          healthScore: connections.length ? Math.round((connected / connections.length) * 100) : platform.isConnected ? 100 : 0,
          lastSyncAt:
            connections
              .map((connection) => connection.lastTransactionSyncAt ?? connection.lastAccountSyncAt ?? connection.lastTradeSyncAt)
              .filter(Boolean)
              .sort((a, b) => Number(b) - Number(a))[0]?.toISOString() ?? platform.lastSyncAt?.toISOString() ?? null
        };
      })
    };
  }
}

function decimal(value: Prisma.Decimal.Value | null | undefined) {
  return new Prisma.Decimal(value ?? 0);
}

function makeAumSeries(aum: Prisma.Decimal) {
  return days.map((day, index) => {
    const factor = new Prisma.Decimal(0.91 + index * 0.015);
    return {
      day,
      aum: Number(aum.mul(factor).toFixed(2))
    };
  });
}

function makeTradingSeries(trades: Array<{ openedAt: Date; volume: Prisma.Decimal; pnl: Prisma.Decimal }>) {
  const buckets = new Map(days.map((day) => [day, { day, volume: 0, pnl: 0, trades: 0 }]));

  trades.forEach((trade) => {
    const key = days[trade.openedAt.getDay() === 0 ? 6 : trade.openedAt.getDay() - 1];
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.volume += Number(trade.volume);
    bucket.pnl += Number(trade.pnl);
    bucket.trades += 1;
  });

  return Array.from(buckets.values()).map((bucket) => ({
    ...bucket,
    volume: Number(bucket.volume.toFixed(2)),
    pnl: Number(bucket.pnl.toFixed(2))
  }));
}

function makeRevenueSeries(
  transactions: Array<{
    requestedAt: Date;
    type: TransactionType;
    amount: Prisma.Decimal;
    feeAmount: Prisma.Decimal;
    status: TransactionStatus;
  }>
) {
  const buckets = new Map(days.map((day) => [day, { day, revenue: 0, deposits: 0, withdrawals: 0 }]));

  transactions.forEach((transaction) => {
    const key = days[transaction.requestedAt.getDay() === 0 ? 6 : transaction.requestedAt.getDay() - 1];
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.revenue += Number(transaction.feeAmount);
    if (transaction.status !== TransactionStatus.COMPLETED) return;
    if (transaction.type === TransactionType.DEPOSIT) bucket.deposits += Number(transaction.amount);
    if (transaction.type === TransactionType.WITHDRAWAL) bucket.withdrawals += Number(transaction.amount);
  });

  return Array.from(buckets.values()).map((bucket) => ({
    ...bucket,
    revenue: Number(bucket.revenue.toFixed(2)),
    deposits: Number(bucket.deposits.toFixed(2)),
    withdrawals: Number(bucket.withdrawals.toFixed(2))
  }));
}

type FunnelAggregate = {
  onboardingStage: OnboardingStage;
  _count?: number | true | { _all?: number };
};

function buildFunnel(leadStages: FunnelAggregate[], clientStages: FunnelAggregate[]) {
  const counts = new Map<OnboardingStage, number>();
  [...leadStages, ...clientStages].forEach((stage) => {
    counts.set(stage.onboardingStage, (counts.get(stage.onboardingStage) ?? 0) + aggregateCount(stage));
  });

  return [
    { stage: "New Lead", count: counts.get(OnboardingStage.NEW_LEAD) ?? 0 },
    { stage: "Contacted", count: counts.get(OnboardingStage.CONTACTED) ?? 0 },
    { stage: "Application", count: counts.get(OnboardingStage.APPLICATION_STARTED) ?? 0 },
    { stage: "KYC Review", count: counts.get(OnboardingStage.KYC_REVIEW) ?? 0 },
    { stage: "Approved", count: counts.get(OnboardingStage.APPROVED) ?? 0 },
    { stage: "Funded", count: counts.get(OnboardingStage.FUNDED) ?? 0 },
    { stage: "Active Trader", count: counts.get(OnboardingStage.ACTIVE_TRADER) ?? 0 }
  ];
}

function aggregateCount(stage: FunnelAggregate) {
  if (typeof stage._count === "number") return stage._count;
  if (typeof stage._count === "object") return stage._count._all ?? 0;
  return 0;
}

export const analyticsService = new AnalyticsService();
