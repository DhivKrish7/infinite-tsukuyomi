import { BrokerConnectionStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toBrokerConnectionContext } from "../core/connection-context";
import { brokerEventBus } from "../core/events";
import { registerBrokerAdapters } from "../plugins/register-broker-adapters";

function asSettings(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export class BrokerConnectionService {
  async listAdapters() {
    return (await registerBrokerAdapters()).list();
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
    const registry = await registerBrokerAdapters();
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

    const context = toBrokerConnectionContext(connection);
    await adapter.connect(context);
    const health = await adapter.getHealth(context);

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
    const adapter = (await registerBrokerAdapters()).get(connection.adapterKey);
    const health = await adapter.getHealth(toBrokerConnectionContext(connection));

    await prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        status: health.ok ? BrokerConnectionStatus.CONNECTED : BrokerConnectionStatus.DEGRADED,
        lastHeartbeatAt: new Date()
      }
    });

    return health;
  }

  async setEnabled(tenantId: string, connectionId: string, enabled: boolean) {
    const connection = await prisma.brokerConnection.findFirstOrThrow({
      where: { id: connectionId, tenantId },
      include: { platform: true }
    });

    const status = enabled ? BrokerConnectionStatus.CONNECTED : BrokerConnectionStatus.SUSPENDED;

    const updated = await prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        status,
        settings: {
          ...asSettings(connection.settings),
          disabledAt: enabled ? null : new Date().toISOString()
        } as Prisma.InputJsonValue,
        platform: {
          update: {
            isConnected: enabled,
            lastSyncAt: enabled ? new Date() : connection.platform.lastSyncAt
          }
        }
      },
      include: {
        platform: { select: { id: true, name: true, type: true, isConnected: true } },
        syncRuns: { orderBy: { createdAt: "desc" }, take: 5 }
      }
    });

    const adapter = (await registerBrokerAdapters()).get(connection.adapterKey);
    if (enabled) {
      await adapter.connect(toBrokerConnectionContext(updated));
    } else {
      await adapter.disconnect(toBrokerConnectionContext(connection));
    }

    await brokerEventBus.publish({
      type: "notification.created",
      tenantId,
      connectionId: connection.id,
      platformId: connection.platformId,
      severity: enabled ? "success" : "warning",
      title: enabled ? "Broker enabled" : "Broker disabled",
      message: `${connection.displayName} was ${enabled ? "enabled" : "disabled"} in the sandbox.`,
      timestamp: new Date().toISOString()
    });

    return updated;
  }

  async reconnect(tenantId: string, connectionId: string) {
    const connectionBefore = await prisma.brokerConnection.findFirstOrThrow({
      where: { id: connectionId, tenantId }
    });
    const adapter = (await registerBrokerAdapters()).get(connectionBefore.adapterKey);
    await adapter.disconnect(toBrokerConnectionContext(connectionBefore));

    await prisma.brokerConnection.update({
      where: { id: connectionId },
      data: { status: BrokerConnectionStatus.CONNECTING }
    });
    await adapter.connect(toBrokerConnectionContext(connectionBefore));

    const health = await this.healthCheck(tenantId, connectionId);
    const connection = await prisma.brokerConnection.findFirstOrThrow({
      where: { id: connectionId, tenantId },
      include: {
        platform: { select: { id: true, name: true, type: true, isConnected: true } },
        syncRuns: { orderBy: { createdAt: "desc" }, take: 5 }
      }
    });

    await brokerEventBus.publish({
      type: "notification.created",
      tenantId,
      connectionId: connection.id,
      platformId: connection.platformId,
      severity: health.ok ? "success" : "critical",
      title: health.ok ? "Reconnect succeeded" : "Reconnect failed",
      message: health.message ?? `${connection.displayName} reconnect completed.`,
      timestamp: new Date().toISOString()
    });

    return { connection, health };
  }

  async setOutage(tenantId: string, connectionId: string, simulateOutage: boolean) {
    const connection = await prisma.brokerConnection.findFirstOrThrow({
      where: { id: connectionId, tenantId },
      include: { platform: true }
    });
    const settings = asSettings(connection.settings);

    const updated = await prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        status: simulateOutage ? BrokerConnectionStatus.DEGRADED : BrokerConnectionStatus.CONNECTED,
        settings: {
          ...settings,
          simulateOutage,
          outageStartedAt: simulateOutage ? new Date().toISOString() : null
        } as Prisma.InputJsonValue,
        lastHeartbeatAt: new Date()
      },
      include: {
        platform: { select: { id: true, name: true, type: true, isConnected: true } },
        syncRuns: { orderBy: { createdAt: "desc" }, take: 5 }
      }
    });

    await brokerEventBus.publish({
      type: "notification.created",
      tenantId,
      connectionId: connection.id,
      platformId: connection.platformId,
      severity: simulateOutage ? "critical" : "success",
      title: simulateOutage ? "Outage simulated" : "Outage cleared",
      message: `${connection.displayName} sandbox outage is ${simulateOutage ? "active" : "cleared"}.`,
      timestamp: new Date().toISOString()
    });

    return updated;
  }
}

export const brokerConnectionService = new BrokerConnectionService();
