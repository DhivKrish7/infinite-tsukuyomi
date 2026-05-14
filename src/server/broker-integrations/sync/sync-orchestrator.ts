import { BrokerSyncType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toBrokerConnectionContext } from "../core/connection-context";
import { registerBrokerAdapters } from "../plugins/register-broker-adapters";
import { AccountSyncEngine } from "./account-sync-engine";
import { TradeSyncEngine } from "./trade-sync-engine";
import { TransactionSyncEngine } from "./transaction-sync-engine";

export class BrokerSyncOrchestrator {
  private readonly accountSync = new AccountSyncEngine();
  private readonly tradeSync = new TradeSyncEngine();
  private readonly transactionSync = new TransactionSyncEngine();

  async syncConnection(input: {
    tenantId: string;
    connectionId: string;
    types?: BrokerSyncType[];
  }) {
    const connection = await prisma.brokerConnection.findFirstOrThrow({
      where: {
        id: input.connectionId,
        tenantId: input.tenantId
      }
    });

    const registry = registerBrokerAdapters();
    const adapter = registry.get(connection.adapterKey);
    const context = toBrokerConnectionContext(connection);
    const types = input.types ?? [BrokerSyncType.ACCOUNTS, BrokerSyncType.TRADES, BrokerSyncType.TRANSACTIONS];
    const results: Partial<Record<BrokerSyncType, unknown>> = {};

    for (const type of types) {
      if (type === BrokerSyncType.ACCOUNTS || type === BrokerSyncType.BALANCES) {
        results[type] = await this.accountSync.sync(adapter, context);
      }

      if (type === BrokerSyncType.TRADES) {
        results[type] = await this.tradeSync.sync(adapter, context);
      }

      if (type === BrokerSyncType.TRANSACTIONS) {
        results[type] = await this.transactionSync.sync(adapter, context);
      }
    }

    return results;
  }
}

export const brokerSyncOrchestrator = new BrokerSyncOrchestrator();
