import type { ActivityEvent, Client, Platform } from "./types";

export const platforms: Platform[] = [
  {
    id: "nebulafx",
    name: "NebulaFX",
    type: "MT5 + MT4",
    color: "#818cf8",
    clients: 614,
    aum: "$17.9M",
    volume: "$4.4M",
    connected: true
  },
  {
    id: "squidfx",
    name: "SquidMarkets",
    type: "cTrader",
    color: "#22d3a5",
    clients: 233,
    aum: "$6.8M",
    volume: "$1.7M",
    connected: true
  },
  {
    id: "tradexo",
    name: "TradeXo",
    type: "MT5 API",
    color: "#6b7a99",
    clients: 0,
    aum: "$0",
    volume: "$0",
    connected: false
  }
];

export const clients: Client[] = [
  {
    id: "NX-10482",
    name: "Marcus Reid",
    email: "marcus.reid@nexusdemo.local",
    platformId: "nebulafx",
    balance: "$84,200",
    pnl: "+$4,120",
    pnlDirection: "positive",
    presence: "online",
    status: "active",
    kyc: "verified",
    risk: "low"
  },
  {
    id: "SQ-00214",
    name: "Priya Kapoor",
    email: "priya.kapoor@nexusdemo.local",
    platformId: "squidfx",
    balance: "$32,000",
    pnl: "+$1,830",
    pnlDirection: "positive",
    presence: "online",
    status: "active",
    kyc: "verified",
    risk: "medium"
  },
  {
    id: "NX-09921",
    name: "Liam Torres",
    email: "liam.torres@nexusdemo.local",
    platformId: "nebulafx",
    balance: "$12,400",
    pnl: "-$560",
    pnlDirection: "negative",
    presence: "offline",
    status: "active",
    kyc: "pending",
    risk: "high"
  },
  {
    id: "SQ-00177",
    name: "Chloe Martin",
    email: "chloe.martin@nexusdemo.local",
    platformId: "squidfx",
    balance: "$14,000",
    pnl: "+$700",
    pnlDirection: "positive",
    presence: "offline",
    status: "suspended",
    kyc: "failed",
    risk: "high"
  }
];

export const activities: ActivityEvent[] = [
  {
    id: "act-1",
    type: "deposit",
    message: "Aiko Yamamoto deposited $50,000 via wire transfer",
    time: "2 min ago",
    platformId: "nebulafx"
  },
  {
    id: "act-2",
    type: "lead",
    message: "New lead signed up via NebulaFX landing page",
    time: "5 min ago",
    platformId: "nebulafx"
  },
  {
    id: "act-3",
    type: "withdrawal",
    message: "Withdrawal request of $12,000 pending KYC",
    time: "8 min ago",
    platformId: "squidfx"
  },
  {
    id: "act-4",
    type: "kyc",
    message: "KYC approved for Marcus Reid",
    time: "15 min ago",
    platformId: "nebulafx"
  },
  {
    id: "act-5",
    type: "risk",
    message: "Margin call alert on account SQ-00388",
    time: "22 min ago",
    platformId: "squidfx"
  },
  {
    id: "act-6",
    type: "sync",
    message: "SquidMarkets data sync completed",
    time: "30 min ago",
    platformId: "squidfx"
  }
];

export const volumeData = [
  { day: "01", volume: 2.4, pnl: 0.4 },
  { day: "05", volume: 2.9, pnl: 0.5 },
  { day: "10", volume: 3.3, pnl: 0.7 },
  { day: "15", volume: 4.1, pnl: 0.8 },
  { day: "20", volume: 4.6, pnl: 1.0 },
  { day: "25", volume: 5.4, pnl: 1.2 },
  { day: "30", volume: 6.1, pnl: 1.5 }
];
