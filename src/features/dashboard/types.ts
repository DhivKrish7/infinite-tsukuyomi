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
  status: "active" | "pending" | "suspended";
  kyc: "verified" | "pending" | "failed";
  risk: "low" | "medium" | "high";
};

export type ActivityEvent = {
  id: string;
  type: "deposit" | "lead" | "withdrawal" | "kyc" | "risk" | "sync";
  message: string;
  time: string;
  platformId: string;
};
