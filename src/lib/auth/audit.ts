import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/request-context";

type AuthAuditInput = {
  tenantId?: string | null;
  actorId?: string | null;
  action: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  request?: NextRequest;
};

export async function writeAuthAudit({
  tenantId,
  actorId,
  action,
  entityId,
  metadata,
  request
}: AuthAuditInput) {
  if (!tenantId) return;

  const context = request ? getRequestContext(request) : { ipAddress: undefined };

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorId: actorId ?? undefined,
      action,
      entity: "auth",
      entityId: entityId ?? actorId ?? undefined,
      metadata: metadata as Prisma.InputJsonValue | undefined,
      ipAddress: context.ipAddress
    }
  });
}
