import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { paginationMeta, parseSearchParams, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { tagCreateInput, serializeTags } from "@/lib/crm/serializers";
import { leadListSchema, createLeadSchema } from "@/lib/crm/validation";
import { prisma } from "@/lib/prisma";

const leadInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  tags: { include: { tag: true } },
  _count: { select: { notes: true, communications: true, tasks: true } }
} satisfies Prisma.LeadInclude;

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = parseSearchParams(request, leadListSchema);
  if (!parsed.success) return validationError();

  const { page, pageSize, q, status, stage, assignedToId, tag } = parsed.data;
  const where: Prisma.LeadWhereInput = {
    tenantId: auth.user.tenantId,
    ...(status ? { status } : {}),
    ...(stage ? { onboardingStage: stage } : {}),
    ...(assignedToId ? { assignedToId } : {}),
    ...(tag ? { tags: { some: { tag: { name: { equals: tag, mode: "insensitive" } } } } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { source: { contains: q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.lead.count({ where })
  ]);

  return NextResponse.json({
    items: items.map((lead) => ({ ...lead, tags: serializeTags(lead.tags) })),
    meta: paginationMeta(total, page, pageSize)
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createLeadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { tags, ...data } = parsed.data;
  const lead = await prisma.lead.create({
    data: {
      ...data,
      tenantId: auth.user.tenantId,
      tags: tags.length ? { create: tagCreateInput(auth.user.tenantId, tags) } : undefined
    },
    include: leadInclude
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_LEAD_CREATED",
    entity: "lead",
    entityId: lead.id,
    metadata: { email: lead.email }
  });

  return NextResponse.json({ item: { ...lead, tags: serializeTags(lead.tags) } }, { status: 201 });
}
