import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, paginationMeta, parseSearchParams, validationError, writeCrmAudit } from "@/lib/crm/api";
import { prisma } from "@/lib/prisma";
import { clientListSchema, createClientSchema } from "@/lib/crm/validation";
import { serializeTags, tagCreateInput } from "@/lib/crm/serializers";

const clientInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  platform: { select: { id: true, name: true, type: true } },
  tags: { include: { tag: true } },
  _count: { select: { notes: true, communications: true, tasks: true, accounts: true } }
} satisfies Prisma.ClientInclude;

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = parseSearchParams(request, clientListSchema);
  if (!parsed.success) return validationError();

  const { page, pageSize, q, status, stage, riskLevel, assignedToId, tag } = parsed.data;
  const where: Prisma.ClientWhereInput = {
    tenantId: auth.user.tenantId,
    ...(status ? { status } : {}),
    ...(stage ? { onboardingStage: stage } : {}),
    ...(riskLevel ? { riskLevel } : {}),
    ...(assignedToId ? { assignedToId } : {}),
    ...(tag ? { tags: { some: { tag: { name: { equals: tag, mode: "insensitive" } } } } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.client.findMany({
      where,
      include: clientInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.client.count({ where })
  ]);

  return NextResponse.json({
    items: items.map((client) => ({ ...client, tags: serializeTags(client.tags) })),
    meta: paginationMeta(total, page, pageSize)
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createClientSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { tags, ...data } = parsed.data;
  const client = await prisma.client.create({
    data: {
      ...data,
      tenantId: auth.user.tenantId,
      tags: tags.length ? { create: tagCreateInput(auth.user.tenantId, tags) } : undefined
    },
    include: clientInclude
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_CLIENT_CREATED",
    entity: "client",
    entityId: client.id,
    metadata: { email: client.email }
  });

  return NextResponse.json({ item: { ...client, tags: serializeTags(client.tags) } }, { status: 201 });
}
