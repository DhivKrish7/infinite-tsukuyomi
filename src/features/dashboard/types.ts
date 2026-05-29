export type Platform = {
  id: string;
  name: string;
  type: string;
  color: string;
  clients: number;
  aum: string;
  volume: string;
  connected: boolean;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  platformId: string;
  balance: string;
  pnl: string;
  pnlDirection: "positive" | "negative";
  presence?: "online" | "offline";
  status: "active" | "pending" | "suspended";
  kyc: "verified" | "pending" | "failed";
  risk: "low" | "medium" | "high";
};

export type ActivityEvent = {
  id: string;
  type: "deposit" | "lead" | "withdrawal" | "kyc" | "risk" | "sync" | "trade" | "client" | "notification";
  message: string;
  time: string;
  platformId: string;
};

export type VolumePoint = {
  day: string;
  volume: number;
  pnl: number;
};

export type LivePrice = {
  key: string;
  broker: string;
  platformId: string;
  symbol: string;
  bid: string;
  ask: string;
  spread: string;
  timestamp: string;
};

export type DashboardRealtimeEvent = {
  type: string;
  id?: string;
  tenantId?: string;
  timestamp?: string;
  platformId?: string;
  clientId?: string;
  clientName?: string;
  amount?: number;
  currency?: string;
  message?: string;
  broker?: string;
  symbol?: string;
  bid?: string;
  ask?: string;
  spread?: string;
  side?: "BUY" | "SELL";
  volume?: string;
  notional?: number;
  pnl?: string;
  status?: "online" | "offline";
  title?: string;
  severity?: "info" | "warning" | "critical" | "success";
};
