import { BrokerSyncType } from "@prisma/client";
import type { BrokerConnectionContext } from "./domain";

type ConnectionRecord = {
  id: string;
  tenantId: string;
  platformId: string;
  adapterKey: string;
  credentials: unknown;
  settings: unknown;
  accountCursor: string | null;
  tradeCursor: string | null;
  transactionCursor: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function toBrokerConnectionContext(connection: ConnectionRecord): BrokerConnectionContext {
  return {
    tenantId: connection.tenantId,
    connectionId: connection.id,
    platformId: connection.platformId,
    adapterKey: connection.adapterKey,
    credentials: asRecord(connection.credentials),
    settings: asRecord(connection.settings),
    cursors: {
      [BrokerSyncType.ACCOUNTS]: connection.accountCursor,
      [BrokerSyncType.TRADES]: connection.tradeCursor,
      [BrokerSyncType.TRANSACTIONS]: connection.transactionCursor
    }
  };
}
