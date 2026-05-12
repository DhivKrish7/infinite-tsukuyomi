import { NextRequest, NextResponse } from "next/server";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { updateTaskSchema } from "@/lib/crm/validation";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = updateTaskSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const { id } = await params;
  const existing = await prisma.taskReminder.findFirst({ where: { id, tenantId: auth.user.tenantId } });
  if (!existing) return notFound("Task");

  const { entityType, entityId, dueAt, completedAt, ...data } = parsed.data;
  const task = await prisma.taskReminder.update({
    where: { id },
    data: {
      ...data,
      clientId: entityType === "client" ? entityId : entityType === "lead" ? null : undefined,
      leadId: entityType === "lead" ? entityId : entityType === "client" ? null : undefined,
      dueAt: dueAt ? new Date(dueAt) : undefined,
      completedAt: completedAt === null ? null : completedAt ? new Date(completedAt) : undefined
    }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_TASK_UPDATED",
    entity: "task",
    entityId: task.id
  });

  return NextResponse.json({ item: task });
}
