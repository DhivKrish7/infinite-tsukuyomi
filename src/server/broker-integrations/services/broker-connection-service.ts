import { BrokerConnectionStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toBrokerConnectionContext } from "../core/connection-context";
import { registerBrokerAdapters } from "../plugins/register-broker-adapters";

export class BrokerConnectionService {
  listAdapters() {
    return registerBrokerAdapters().list();
  }

  async listConnections(tenantId: string) {
    return prisma.brokerConnection.findMany({
      where: { tenantId },
      include: {
        platform: { select: { id: true, name: true, type: true, isConnected: true } },
        syncRuns: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createConnection(input: {
    tenantId: string;
    adapterKey: string;
    displayName: string;
    platformName: string;
    platformType: string;
    credentials: Record<string, unknown>;
    settings: Record<string, unknown>;
  }) {
    const registry = registerBrokerAdapters();
    const adapter = registry.get(input.adapterKey);
    await adapter.validateConfig({ credentials: input.credentials, settings: input.settings });

    const platform = await prisma.tradingPlatform.upsert({
      where: {
        tenantId_name: {
          tenantId: input.tenantId,
          name: input.platformName
        }
      },
      update: {
        type: input.platformType,
        isConnected: true
      },
      create: {
        tenantId: input.tenantId,
        name: input.platformName,
        type: input.platformType,
        isConnected: true
      }
    });

    const connection = await prisma.brokerConnection.create({
      data: {
        tenantId: input.tenantId,
        platformId: platform.id,
        adapterKey: input.adapterKey,
        displayName: input.displayName,
        credentials: input.credentials as Prisma.InputJsonValue,
        settings: input.settings as Prisma.InputJsonValue,
        status: BrokerConnectionStatus.CONNECTING
      }
    });

    const health = await adapter.healthCheck(toBrokerConnectionContext(connection));

    return prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        status: health.ok ? BrokerConnectionStatus.CONNECTED : BrokerConnectionStatus.ERROR,
        lastHeartbeatAt: new Date()
      },
      include: {
        platform: { select: { id: true, name: true, type: true, isConnected: true } }
      }
    });
  }

  async healthCheck(tenantId: string, connectionId: string) {
    const connection = await prisma.brokerConnection.findFirstOrThrow({
      where: { id: connectionId, tenantId }
    });
    const adapter = registerBrokerAdapters().get(connection.adapterKey);
    const health = await adapter.healthCheck(toBrokerConnectionContext(connection));

    await prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        status: health.ok ? BrokerConnectionStatus.CONNECTED : BrokerConnectionStatus.DEGRADED,
        lastHeartbeatAt: new Date()
      }
    });

    return health;
  }
}

export const brokerConnectionService = new BrokerConnectionService();
