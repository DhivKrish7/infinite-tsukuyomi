import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { serializeTags, tagCreateInput, toNullableDate } from "@/lib/crm/serializers";
import { updateLeadSchema } from "@/lib/crm/validation";
import { prisma } from "@/lib/prisma";

const leadDetailInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  tags: { include: { tag: true } },
  notes: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
  communications: { include: { createdBy: { select: { id: true, name: true } } }, orderBy: { occurredAt: "desc" } },
  tasks: { include: { assignedTo: { select: { id: true, name: true } } }, orderBy: { dueAt: "asc" } },
  convertedClient: { select: { id: true, name: true, email: true, status: true } }
} satisfies Prisma.LeadInclude;

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const lead = await prisma.lead.findFirst({
    where: { id, tenantId: auth.user.tenantId },
    include: leadDetailInclude
  });

  if (!lead) return notFound("Lead");

  return NextResponse.json({ item: { ...lead, tags: serializeTags(lead.tags) } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = updateLeadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { id } = await params;
  const existing = await prisma.lead.findFirst({ where: { id, tenantId: auth.user.tenantId } });
  if (!existing) return notFound("Lead");

  const { tags, nextFollowUpAt, lastContactedAt, convertedAt, ...data } = parsed.data;
  const lead = await prisma.$transaction(async (tx) => {
    if (tags) {
      await tx.leadTag.deleteMany({ where: { leadId: id } });
    }

    return tx.lead.update({
      where: { id },
      data: {
        ...data,
        nextFollowUpAt: toNullableDate(nextFollowUpAt),
        lastContactedAt: toNullableDate(lastContactedAt),
        convertedAt: toNullableDate(convertedAt),
        tags: tags ? { create: tagCreateInput(auth.user.tenantId, tags) } : undefined
      },
      include: leadDetailInclude
    });
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_LEAD_UPDATED",
    entity: "lead",
    entityId: lead.id
  });

  return NextResponse.json({ item: { ...lead, tags: serializeTags(lead.tags) } });
}
