import { prisma } from "@/lib/prisma";

type ExposureBucket = {
  key: string;
  net: number;
  gross: number;
  long: number;
  short: number;
  pnl: number;
  openTrades: number;
};

function decimalNumber(value: unknown) {
  return Number(value ?? 0);
}

function tradeDirection(side: string) {
  return side.toUpperCase() === "BUY" || side.toUpperCase() === "LONG" ? 1 : -1;
}

function quoteCurrency(symbol: string) {
  const compact = symbol.replace(/[^A-Za-z]/g, "").toUpperCase();
  return compact.length >= 6 ? compact.slice(-3) : "UNKNOWN";
}

function addExposure(bucket: ExposureBucket, signedNotional: number, pnl: number) {
  bucket.net += signedNotional;
  bucket.gross += Math.abs(signedNotional);
  bucket.pnl += pnl;
  bucket.openTrades += 1;

  if (signedNotional >= 0) bucket.long += signedNotional;
  else bucket.short += Math.abs(signedNotional);
}

export class ExposureService {
  async getOverview(tenantId: string) {
    const [accounts, trades] = await Promise.all([
      prisma.tradingAccount.findMany({
        where: { client: { tenantId } },
        select: {
          id: true,
          login: true,
          currency: true,
          balance: true,
          equity: true,
          margin: true,
          client: { select: { id: true, name: true, email: true } },
          platform: { select: { id: true, name: true } }
        }
      }),
      prisma.trade.findMany({
        where: {
          closedAt: null,
          account: { client: { tenantId } }
        },
        include: {
          account: {
            select: {
              id: true,
              login: true,
              currency: true,
              client: { select: { id: true, name: true } },
              platform: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { openedAt: "desc" }
      })
    ]);

    const bySymbol = new Map<string, ExposureBucket>();
    const byCurrency = new Map<string, ExposureBucket & { accountEquity: number; accountBalance: number; accountMargin: number }>();

    for (const account of accounts) {
      const key = account.currency;
      const bucket = byCurrency.get(key) ?? {
        key,
        net: 0,
        gross: 0,
        long: 0,
        short: 0,
        pnl: 0,
        openTrades: 0,
        accountEquity: 0,
        accountBalance: 0,
        accountMargin: 0
      };
      bucket.accountEquity += decimalNumber(account.equity);
      bucket.accountBalance += decimalNumber(account.balance);
      bucket.accountMargin += decimalNumber(account.margin);
      byCurrency.set(key, bucket);
    }

    let netExposure = 0;
    let grossExposure = 0;
    let longExposure = 0;
    let shortExposure = 0;
    let openPnl = 0;

    for (const trade of trades) {
      const notional = decimalNumber(trade.volume) * decimalNumber(trade.openPrice);
      const signedNotional = notional * tradeDirection(trade.side);
      const pnl = decimalNumber(trade.pnl);

      netExposure += signedNotional;
      grossExposure += Math.abs(signedNotional);
      openPnl += pnl;
      if (signedNotional >= 0) longExposure += signedNotional;
      else shortExposure += Math.abs(signedNotional);

      const symbolBucket = bySymbol.get(trade.symbol) ?? {
        key: trade.symbol,
        net: 0,
        gross: 0,
        long: 0,
        short: 0,
        pnl: 0,
        openTrades: 0
      };
      addExposure(symbolBucket, signedNotional, pnl);
      bySymbol.set(trade.symbol, symbolBucket);

      const currency = quoteCurrency(trade.symbol);
      const currencyBucket = byCurrency.get(currency) ?? {
        key: currency,
        net: 0,
        gross: 0,
        long: 0,
        short: 0,
        pnl: 0,
        openTrades: 0,
        accountEquity: 0,
        accountBalance: 0,
        accountMargin: 0
      };
      addExposure(currencyBucket, signedNotional, pnl);
      byCurrency.set(currency, currencyBucket);
    }

    return {
      summary: {
        accounts: accounts.length,
        openTrades: trades.length,
        netExposure,
        grossExposure,
        longExposure,
        shortExposure,
        openPnl
      },
      symbolExposure: Array.from(bySymbol.values()).sort((a, b) => Math.abs(b.net) - Math.abs(a.net)),
      currencyExposure: Array.from(byCurrency.values()).sort((a, b) => Math.abs(b.net) - Math.abs(a.net)),
      openTrades: trades.map((trade) => ({
        id: trade.id,
        ticket: trade.ticket,
        symbol: trade.symbol,
        side: trade.side,
        volume: decimalNumber(trade.volume),
        openPrice: decimalNumber(trade.openPrice),
        pnl: decimalNumber(trade.pnl),
        openedAt: trade.openedAt,
        account: trade.account
      }))
    };
  }
}

export const exposureService = new ExposureService();
