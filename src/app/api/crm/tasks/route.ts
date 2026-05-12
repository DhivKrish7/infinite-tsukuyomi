import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { paginationMeta, parseSearchParams, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { createTaskSchema, taskListSchema } from "@/lib/crm/validation";
import { prisma } from "@/lib/prisma";

const taskInclude = {
  client: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true } }
} satisfies Prisma.TaskReminderInclude;

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = parseSearchParams(request, taskListSchema);
  if (!parsed.success) return validationError();

  const { page, pageSize, q, status, priority, assignedToId, entityType, entityId } = parsed.data;
  const where: Prisma.TaskReminderWhereInput = {
    tenantId: auth.user.tenantId,
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(assignedToId ? { assignedToId } : {}),
    ...(entityType === "client" && entityId ? { clientId: entityId } : {}),
    ...(entityType === "lead" && entityId ? { leadId: entityId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.taskReminder.findMany({
      where,
      include: taskInclude,
      orderBy: [{ status: "asc" }, { dueAt: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.taskReminder.count({ where })
  ]);

  return NextResponse.json({ items, meta: paginationMeta(total, page, pageSize) });
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createTaskSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { entityType, entityId, dueAt, ...data } = parsed.data;
  const task = await prisma.taskReminder.create({
    data: {
      ...data,
      tenantId: auth.user.tenantId,
      createdById: auth.user.id,
      assignedToId: data.assignedToId ?? auth.user.id,
      clientId: entityType === "client" ? entityId : undefined,
      leadId: entityType === "lead" ? entityId : undefined,
      dueAt: new Date(dueAt)
    },
    include: taskInclude
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_TASK_CREATED",
    entity: "task",
    entityId: task.id
  });

  return NextResponse.json({ item: task }, { status: 201 });
}
