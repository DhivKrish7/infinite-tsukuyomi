import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmSavedFilterSchema } from "@/lib/crm/validation";
import { isCrmExtensionEnabled, toJson } from "@/lib/crm/extensions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "saved-filters"))) {
    return NextResponse.json({ error: "Saved filters module is disabled" }, { status: 409 });
  }

  const id = (await params).id;
  const existing = await prisma.crmSavedFilter.findFirst({ where: { id, tenantId: auth.user.tenantId, ownerId: auth.user.id } });
  if (!existing) return notFound("Saved filter");

  const parsed = crmSavedFilterSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmSavedFilter.update({
    where: { id },
    data: {
      target: parsed.data.target,
      name: parsed.data.name,
      criteria: parsed.data.criteria ? toJson(parsed.data.criteria) : undefined,
      isShared: parsed.data.isShared
    }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_SAVED_FILTER_UPDATED",
    entity: "crm_saved_filter",
    entityId: item.id
  });

  return NextResponse.json({ item });
}
