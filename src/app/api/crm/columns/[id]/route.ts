import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmColumnPreferenceSchema } from "@/lib/crm/validation";
import { isCrmExtensionEnabled } from "@/lib/crm/extensions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "editable-columns"))) {
    return NextResponse.json({ error: "Editable columns module is disabled" }, { status: 409 });
  }

  const id = (await params).id;
  const existing = await prisma.crmColumnPreference.findFirst({ where: { id, tenantId: auth.user.tenantId, ownerId: auth.user.id } });
  if (!existing) return notFound("Column preference");

  const parsed = crmColumnPreferenceSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmColumnPreference.update({
    where: { id },
    data: {
      label: parsed.data.label,
      visible: parsed.data.visible,
      order: parsed.data.order,
      width: parsed.data.width,
      pinned: parsed.data.pinned
    }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_COLUMN_PREFERENCE_UPDATED",
    entity: "crm_column_preference",
    entityId: item.id
  });

  return NextResponse.json({ item });
}
