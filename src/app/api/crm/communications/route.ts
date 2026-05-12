import { NextRequest, NextResponse } from "next/server";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { createCommunicationSchema } from "@/lib/crm/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createCommunicationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { entityType, entityId, occurredAt, ...data } = parsed.data;
  const relation =
    entityType === "client"
      ? await prisma.client.findFirst({ where: { id: entityId, tenantId: auth.user.tenantId } })
      : await prisma.lead.findFirst({ where: { id: entityId, tenantId: auth.user.tenantId } });

  if (!relation) return notFound(entityType === "client" ? "Client" : "Lead");

  const communication = await prisma.communicationLog.create({
    data: {
      ...data,
      tenantId: auth.user.tenantId,
      createdById: auth.user.id,
      clientId: entityType === "client" ? entityId : undefined,
      leadId: entityType === "lead" ? entityId : undefined,
      occurredAt: occurredAt ? new Date(occurredAt) : undefined
    },
    include: { createdBy: { select: { id: true, name: true } } }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_COMMUNICATION_LOGGED",
    entity: entityType,
    entityId,
    metadata: { type: data.type, direction: data.direction }
  });

  return NextResponse.json({ item: communication }, { status: 201 });
}
