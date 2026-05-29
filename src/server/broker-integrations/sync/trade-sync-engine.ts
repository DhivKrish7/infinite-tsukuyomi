import { BrokerSyncStatus, BrokerSyncType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BrokerAdapter } from "../core/adapter";
import type { BrokerConnectionContext } from "../core/domain";
import { brokerEventBus } from "../core/events";
import { completeSyncRun, startSyncRun } from "./sync-run-recorder";

export class TradeSyncEngine {
  async sync(adapter: BrokerAdapter, context: BrokerConnectionContext) {
    const cursorBefore = context.cursors[BrokerSyncType.TRADES] ?? null;
    const run = await startSyncRun({
      tenantId: context.tenantId,
      connectionId: context.connectionId,
      type: BrokerSyncType.TRADES,
      cursorBefore
    });

    try {
      const page = await adapter.syncTrades(context, cursorBefore);
      let upserted = 0;

      for (const trade of page.items) {
        const account = await prisma.tradingAccount.findUnique({
          where: {
            platformId_login: {
              platformId: context.platformId,
              login: trade.accountLogin
            }
          }
        });

        if (!account) continue;

        await prisma.trade.upsert({
          where: {
            accountId_ticket: {
              accountId: account.id,
              ticket: trade.externalTradeId
            }
          },
          update: {
            symbol: trade.symbol,
            side: trade.side,
            volume: trade.volume,
            openPrice: trade.openPrice,
            closePrice: trade.closePrice ?? undefined,
            pnl: trade.pnl,
            openedAt: new Date(trade.openedAt),
            closedAt: trade.closedAt ? new Date(trade.closedAt) : null
          },
          create: {
            accountId: account.id,
            ticket: trade.externalTradeId,
            symbol: trade.symbol,
            side: trade.side,
            volume: trade.volume,
            openPrice: trade.openPrice,
            closePrice: trade.closePrice ?? undefined,
            pnl: trade.pnl,
            openedAt: new Date(trade.openedAt),
            closedAt: trade.closedAt ? new Date(trade.closedAt) : undefined
          }
        });

        await brokerEventBus.publish({
          type: trade.closedAt ? "trade.closed" : "trade.opened",
          tenantId: context.tenantId,
          connectionId: context.connectionId,
          platformId: context.platformId,
          broker: adapter.displayName,
          login: trade.accountLogin,
          symbol: trade.symbol,
          side: trade.side,
          volume: trade.volume,
          pnl: trade.pnl,
          timestamp: trade.closedAt ?? trade.openedAt
        });

        upserted += 1;
      }

      await prisma.brokerConnection.update({
        where: { id: context.connectionId },
        data: {
          tradeCursor: page.nextCursor,
          lastTradeSyncAt: new Date()
        }
      });

      await completeSyncRun({
        id: run.id,
        status: BrokerSyncStatus.SUCCEEDED,
        cursorAfter: page.nextCursor,
        recordsRead: page.items.length,
        recordsUpserted: upserted
      });

      return { recordsRead: page.items.length, recordsUpserted: upserted, nextCursor: page.nextCursor };
    } catch (error) {
      await completeSyncRun({
        id: run.id,
        status: BrokerSyncStatus.FAILED,
        recordsRead: 0,
        recordsUpserted: 0,
        error: error instanceof Error ? error.message : "Unknown trade sync error"
      });
      throw error;
    }
  }
}
