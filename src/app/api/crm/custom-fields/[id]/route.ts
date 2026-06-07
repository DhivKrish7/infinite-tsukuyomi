import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound, requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmCustomFieldSchema } from "@/lib/crm/validation";
import { isCrmExtensionEnabled, toJson } from "@/lib/crm/extensions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "custom-fields"))) {
    return NextResponse.json({ error: "Custom fields module is disabled" }, { status: 409 });
  }

  const id = (await params).id;
  const existing = await prisma.crmCustomField.findFirst({ where: { id, tenantId: auth.user.tenantId } });
  if (!existing) return notFound("Custom field");

  const parsed = crmCustomFieldSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmCustomField.update({
    where: { id },
    data: {
      target: parsed.data.target,
      key: parsed.data.key,
      label: parsed.data.label,
      type: parsed.data.type,
      required: parsed.data.required,
      options: parsed.data.options ? toJson(parsed.data.options) : undefined,
      defaultValue: parsed.data.defaultValue === undefined ? undefined : toJson(parsed.data.defaultValue),
      active: parsed.data.active,
      order: parsed.data.order
    }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_CUSTOM_FIELD_UPDATED",
    entity: "crm_custom_field",
    entityId: item.id
  });

  return NextResponse.json({ item });
}
