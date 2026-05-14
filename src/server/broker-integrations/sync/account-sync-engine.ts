import { BrokerSyncStatus, BrokerSyncType, ClientStatus, OnboardingStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BrokerAdapter } from "../core/adapter";
import type { BrokerConnectionContext } from "../core/domain";
import { brokerEventBus } from "../core/events";
import { completeSyncRun, startSyncRun } from "./sync-run-recorder";

export class AccountSyncEngine {
  async sync(adapter: BrokerAdapter, context: BrokerConnectionContext) {
    const cursorBefore = context.cursors[BrokerSyncType.ACCOUNTS] ?? null;
    const run = await startSyncRun({
      tenantId: context.tenantId,
      connectionId: context.connectionId,
      type: BrokerSyncType.ACCOUNTS,
      cursorBefore
    });

    try {
      const page = await adapter.fetchAccounts(context, cursorBefore);
      let upserted = 0;

      for (const account of page.items) {
        const client = await prisma.client.upsert({
          where: {
            tenantId_email: {
              tenantId: context.tenantId,
              email: account.clientEmail
            }
          },
          update: {
            name: account.clientName,
            externalId: account.externalClientId,
            status: ClientStatus.ACTIVE,
            onboardingStage: OnboardingStage.ACTIVE_TRADER
          },
          create: {
            tenantId: context.tenantId,
            platformId: context.platformId,
            externalId: account.externalClientId,
            name: account.clientName,
            email: account.clientEmail,
            status: ClientStatus.ACTIVE,
            onboardingStage: OnboardingStage.ACTIVE_TRADER
          }
        });

        const tradingAccount = await prisma.tradingAccount.upsert({
          where: {
            platformId_login: {
              platformId: context.platformId,
              login: account.login
            }
          },
          update: {
            clientId: client.id,
            currency: account.currency,
            balance: account.balance,
            equity: account.equity,
            margin: account.margin
          },
          create: {
            clientId: client.id,
            platformId: context.platformId,
            login: account.login,
            currency: account.currency,
            balance: account.balance,
            equity: account.equity,
            margin: account.margin
          }
        });

        await prisma.accountBalanceSnapshot.create({
          data: {
            accountId: tradingAccount.id,
            balance: account.balance,
            equity: account.equity,
            margin: account.margin,
            freeMargin: account.freeMargin ?? "0",
            credit: account.credit ?? "0",
            currency: account.currency,
            capturedAt: new Date(account.updatedAt)
          }
        });

        await brokerEventBus.publish({
          type: "balance.updated",
          connectionId: context.connectionId,
          platformId: context.platformId,
          account
        });

        upserted += 1;
      }

      await prisma.brokerConnection.update({
        where: { id: context.connectionId },
        data: {
          accountCursor: page.nextCursor,
          lastAccountSyncAt: new Date()
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
        error: error instanceof Error ? error.message : "Unknown account sync error"
      });
      throw error;
    }
  }
}
