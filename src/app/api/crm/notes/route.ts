import { NextRequest, NextResponse } from "next/server";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { createNoteSchema } from "@/lib/crm/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createNoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { entityType, entityId, body, pinned } = parsed.data;

  if (entityType === "client") {
    const client = await prisma.client.findFirst({ where: { id: entityId, tenantId: auth.user.tenantId } });
    if (!client) return notFound("Client");

    const note = await prisma.clientNote.create({
      data: { clientId: entityId, authorId: auth.user.id, body, pinned },
      include: { author: { select: { id: true, name: true } } }
    });

    await writeCrmAudit({
      tenantId: auth.user.tenantId,
      actorId: auth.user.id,
      action: "CRM_CLIENT_NOTE_CREATED",
      entity: "client",
      entityId
    });

    return NextResponse.json({ item: note }, { status: 201 });
  }

  const lead = await prisma.lead.findFirst({ where: { id: entityId, tenantId: auth.user.tenantId } });
  if (!lead) return notFound("Lead");

  const note = await prisma.leadNote.create({
    data: { leadId: entityId, authorId: auth.user.id, body, pinned },
    include: { author: { select: { id: true, name: true } } }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_LEAD_NOTE_CREATED",
    entity: "lead",
    entityId
  });

  return NextResponse.json({ item: note }, { status: 201 });
}
