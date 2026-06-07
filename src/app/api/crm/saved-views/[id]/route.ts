import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmSavedViewSchema } from "@/lib/crm/validation";
import { isCrmExtensionEnabled, toJson } from "@/lib/crm/extensions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "saved-views"))) {
    return NextResponse.json({ error: "Saved views module is disabled" }, { status: 409 });
  }

  const id = (await params).id;
  const existing = await prisma.crmSavedView.findFirst({ where: { id, tenantId: auth.user.tenantId, ownerId: auth.user.id } });
  if (!existing) return notFound("Saved view");

  const parsed = crmSavedViewSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmSavedView.update({
    where: { id },
    data: {
      target: parsed.data.target,
      filterId: parsed.data.filterId,
      name: parsed.data.name,
      columns: parsed.data.columns ? toJson(parsed.data.columns) : undefined,
      sort: parsed.data.sort ? toJson(parsed.data.sort) : undefined,
      layout: parsed.data.layout ? toJson(parsed.data.layout) : undefined,
      isDefault: parsed.data.isDefault,
      isShared: parsed.data.isShared
    }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_SAVED_VIEW_UPDATED",
    entity: "crm_saved_view",
    entityId: item.id
  });

  return NextResponse.json({ item });
}
