import type { AnalyticsOverview } from "./types";

const now = Date.now();

export const demoAnalyticsOverview: AnalyticsOverview = {
  realtime: {
    activeClients: 847,
    openAccounts: 1032,
    connectedBrokers: 2,
    pendingWithdrawals: 5,
    lastUpdatedAt: new Date(now).toISOString()
  },
  metrics: {
    aum: "24700000.00",
    balance: "23950000.00",
    margin: "1840000.00",
    tradingVolume: "6110000.00",
    pnl: "1480000.00",
    tradesCount: 18420,
    revenue: "412850.00",
    deposits: "1842500.00",
    withdrawals: "972400.00",
    netFlow: "870100.00",
    retentionRate: "88.4",
    churnRisk: 43,
    conversionRate: "19.7"
  },
  aumSeries: [
    { day: "Mon", aum: 21800000 },
    { day: "Tue", aum: 22350000 },
    { day: "Wed", aum: 22910000 },
    { day: "Thu", aum: 23140000 },
    { day: "Fri", aum: 23820000 },
    { day: "Sat", aum: 24200000 },
    { day: "Sun", aum: 24700000 }
  ],
  tradingActivity: [
    { day: "Mon", volume: 760000, pnl: 180000, trades: 2190 },
    { day: "Tue", volume: 840000, pnl: 210000, trades: 2410 },
    { day: "Wed", volume: 920000, pnl: 245000, trades: 2660 },
    { day: "Thu", volume: 810000, pnl: 165000, trades: 2320 },
    { day: "Fri", volume: 1120000, pnl: 310000, trades: 3180 },
    { day: "Sat", volume: 780000, pnl: 175000, trades: 2210 },
    { day: "Sun", volume: 880000, pnl: 195000, trades: 2450 }
  ],
  revenueSeries: [
    { day: "Mon", revenue: 48200, deposits: 210000, withdrawals: 110000 },
    { day: "Tue", revenue: 53100, deposits: 250000, withdrawals: 132000 },
    { day: "Wed", revenue: 60200, deposits: 305000, withdrawals: 141000 },
    { day: "Thu", revenue: 57400, deposits: 265000, withdrawals: 125000 },
    { day: "Fri", revenue: 79400, deposits: 392000, withdrawals: 188000 },
    { day: "Sat", revenue: 52100, deposits: 198000, withdrawals: 121000 },
    { day: "Sun", revenue: 62450, deposits: 222500, withdrawals: 155400 }
  ],
  retention: [
    { segment: "Active", clients: 847 },
    { segment: "Inactive", clients: 31 },
    { segment: "Suspended", clients: 12 }
  ],
  conversionFunnel: [
    { stage: "New Lead", count: 1240 },
    { stage: "Contacted", count: 940 },
    { stage: "Application", count: 610 },
    { stage: "KYC Review", count: 420 },
    { stage: "Approved", count: 310 },
    { stage: "Funded", count: 244 },
    { stage: "Active Trader", count: 198 }
  ],
  brokerPerformance: [
    {
      id: "nebulafx",
      name: "NebulFX",
      type: "MT5 + MT4",
      clients: 614,
      accounts: 720,
      connections: 1,
      connected: 1,
      healthScore: 98,
      lastSyncAt: new Date(now - 4 * 60 * 1000).toISOString()
    },
    {
      id: "squidfx",
      name: "SquidFX",
      type: "cTrader",
      clients: 233,
      accounts: 312,
      connections: 1,
      connected: 1,
      healthScore: 94,
      lastSyncAt: new Date(now - 8 * 60 * 1000).toISOString()
    }
  ]
};
