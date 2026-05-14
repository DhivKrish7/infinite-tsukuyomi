import { BrokerSyncStatus, BrokerSyncType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BrokerAdapter } from "../core/adapter";
import type { BrokerConnectionContext } from "../core/domain";
import { completeSyncRun, startSyncRun } from "./sync-run-recorder";

export class TransactionSyncEngine {
  async sync(adapter: BrokerAdapter, context: BrokerConnectionContext) {
    const cursorBefore = context.cursors[BrokerSyncType.TRANSACTIONS] ?? null;
    const run = await startSyncRun({
      tenantId: context.tenantId,
      connectionId: context.connectionId,
      type: BrokerSyncType.TRANSACTIONS,
      cursorBefore
    });

    try {
      const page = await adapter.fetchTransactions(context, cursorBefore);
      let upserted = 0;

      for (const transaction of page.items) {
        const client = await prisma.client.findUnique({
          where: {
            tenantId_email: {
              tenantId: context.tenantId,
              email: transaction.clientEmail
            }
          }
        });

        if (!client) continue;

        const existing = await prisma.transaction.findFirst({
          where: {
            tenantId: context.tenantId,
            reference: transaction.externalTransactionId
          }
        });

        if (existing) {
          await prisma.transaction.update({
            where: { id: existing.id },
            data: {
              status: transaction.status,
              amount: transaction.amount,
              currency: transaction.currency,
              method: transaction.method,
              processedAt: transaction.processedAt ? new Date(transaction.processedAt) : null
            }
          });
        } else {
          await prisma.transaction.create({
            data: {
              tenantId: context.tenantId,
              clientId: client.id,
              type: transaction.type,
              status: transaction.status,
              amount: transaction.amount,
              currency: transaction.currency,
              method: transaction.method,
              reference: transaction.externalTransactionId,
              requestedAt: new Date(transaction.requestedAt),
              processedAt: transaction.processedAt ? new Date(transaction.processedAt) : undefined
            }
          });
        }

        upserted += 1;
      }

      await prisma.brokerConnection.update({
        where: { id: context.connectionId },
        data: {
          transactionCursor: page.nextCursor,
          lastTransactionSyncAt: new Date()
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
        error: error instanceof Error ? error.message : "Unknown transaction sync error"
      });
      throw error;
    }
  }
}
