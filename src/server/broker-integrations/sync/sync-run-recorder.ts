import { BrokerSyncStatus, BrokerSyncType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function startSyncRun(input: {
  tenantId: string;
  connectionId: string;
  type: BrokerSyncType;
  cursorBefore?: string | null;
}) {
  return prisma.brokerSyncRun.create({
    data: {
      tenantId: input.tenantId,
      connectionId: input.connectionId,
      type: input.type,
      status: BrokerSyncStatus.RUNNING,
      cursorBefore: input.cursorBefore,
      startedAt: new Date()
    }
  });
}

export async function completeSyncRun(input: {
  id: string;
  status: BrokerSyncStatus;
  cursorAfter?: string | null;
  recordsRead: number;
  recordsUpserted: number;
  error?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.brokerSyncRun.update({
    where: { id: input.id },
    data: {
      status: input.status,
      cursorAfter: input.cursorAfter,
      recordsRead: input.recordsRead,
      recordsUpserted: input.recordsUpserted,
      error: input.error,
      metadata: input.metadata,
      completedAt: new Date()
    }
  });
}
