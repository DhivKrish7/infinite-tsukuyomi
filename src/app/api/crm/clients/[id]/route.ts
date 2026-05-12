import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { prisma } from "@/lib/prisma";
import { serializeTags, tagCreateInput, toNullableDate } from "@/lib/crm/serializers";
import { updateClientSchema } from "@/lib/crm/validation";

const clientDetailInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  platform: { select: { id: true, name: true, type: true } },
  tags: { include: { tag: true } },
  notes: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
  communications: { include: { createdBy: { select: { id: true, name: true } } }, orderBy: { occurredAt: "desc" } },
  tasks: { include: { assignedTo: { select: { id: true, name: true } } }, orderBy: { dueAt: "asc" } },
  accounts: { include: { platform: { select: { id: true, name: true } } } }
} satisfies Prisma.ClientInclude;

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, tenantId: auth.user.tenantId },
    include: clientDetailInclude
  });

  if (!client) return notFound("Client");

  return NextResponse.json({ item: { ...client, tags: serializeTags(client.tags) } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = updateClientSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { id } = await params;
  const existing = await prisma.client.findFirst({ where: { id, tenantId: auth.user.tenantId } });
  if (!existing) return notFound("Client");

  const { tags, nextFollowUpAt, lastContactedAt, ...data } = parsed.data;
  const client = await prisma.$transaction(async (tx) => {
    if (tags) {
      await tx.clientTag.deleteMany({ where: { clientId: id } });
    }

    return tx.client.update({
      where: { id },
      data: {
        ...data,
        nextFollowUpAt: toNullableDate(nextFollowUpAt),
        lastContactedAt: toNullableDate(lastContactedAt),
        tags: tags ? { create: tagCreateInput(auth.user.tenantId, tags) } : undefined
      },
      include: clientDetailInclude
    });
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_CLIENT_UPDATED",
    entity: "client",
    entityId: client.id
  });

  return NextResponse.json({ item: { ...client, tags: serializeTags(client.tags) } });
}
