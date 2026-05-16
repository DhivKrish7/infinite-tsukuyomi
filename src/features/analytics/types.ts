export type AnalyticsRealtime = {
  activeClients: number;
  openAccounts: number;
  connectedBrokers: number;
  pendingWithdrawals: number;
  lastUpdatedAt: string;
};

export type AnalyticsMetrics = {
  aum: string | number;
  balance: string | number;
  margin: string | number;
  tradingVolume: string | number;
  pnl: string | number;
  tradesCount: number;
  revenue: string | number;
  deposits: string | number;
  withdrawals: string | number;
  netFlow: string | number;
  retentionRate: string | number;
  churnRisk: number;
  conversionRate: string | number;
};

export type AumPoint = {
  day: string;
  aum: number;
};

export type TradingActivityPoint = {
  day: string;
  volume: number;
  pnl: number;
  trades: number;
};

export type RevenuePoint = {
  day: string;
  revenue: number;
  deposits: number;
  withdrawals: number;
};

export type RetentionSegment = {
  segment: string;
  clients: number;
};

export type FunnelStage = {
  stage: string;
  count: number;
};

export type BrokerPerformance = {
  id: string;
  name: string;
  type: string;
  clients: number;
  accounts: number;
  connections: number;
  connected: number;
  healthScore: number;
  lastSyncAt?: string | null;
};

export type AnalyticsOverview = {
  realtime: AnalyticsRealtime;
  metrics: AnalyticsMetrics;
  aumSeries: AumPoint[];
  tradingActivity: TradingActivityPoint[];
  revenueSeries: RevenuePoint[];
  retention: RetentionSegment[];
  conversionFunnel: FunnelStage[];
  brokerPerformance: BrokerPerformance[];
};
