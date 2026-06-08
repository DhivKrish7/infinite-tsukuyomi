export type ExposureBucket = {
  key: string;
  net: number;
  gross: number;
  long: number;
  short: number;
  pnl: number;
  openTrades: number;
  accountEquity?: number;
  accountBalance?: number;
  accountMargin?: number;
};

export type ExposureOpenTrade = {
  id: string;
  ticket: string;
  symbol: string;
  side: string;
  volume: number;
  openPrice: number;
  pnl: number;
  openedAt: string;
  account: {
    id: string;
    login: string;
    currency: string;
    client: { id: string; name: string };
    platform: { id: string; name: string };
  };
};

export type ExposureOverview = {
  summary: {
    accounts: number;
    openTrades: number;
    netExposure: number;
    grossExposure: number;
    longExposure: number;
    shortExposure: number;
    openPnl: number;
  };
  symbolExposure: ExposureBucket[];
  currencyExposure: ExposureBucket[];
  openTrades: ExposureOpenTrade[];
};
