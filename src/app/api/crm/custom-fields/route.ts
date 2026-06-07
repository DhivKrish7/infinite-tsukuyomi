import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmCustomFieldSchema, crmExtensionListSchema } from "@/lib/crm/validation";
import { isCrmExtensionEnabled, toJson } from "@/lib/crm/extensions";

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "custom-fields"))) return NextResponse.json({ items: [] });

  const parsed = crmExtensionListSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return validationError();

  const items = await prisma.crmCustomField.findMany({
    where: {
      tenantId: auth.user.tenantId,
      ...(parsed.data.target ? { target: parsed.data.target } : {})
    },
    orderBy: [{ target: "asc" }, { order: "asc" }, { label: "asc" }]
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "custom-fields"))) {
    return NextResponse.json({ error: "Custom fields module is disabled" }, { status: 409 });
  }

  const parsed = crmCustomFieldSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmCustomField.create({
    data: {
      tenantId: auth.user.tenantId,
      moduleKey: parsed.data.moduleKey,
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
    action: "CRM_CUSTOM_FIELD_CREATED",
    entity: "crm_custom_field",
    entityId: item.id,
    metadata: { target: item.target, key: item.key }
  });

  return NextResponse.json({ item }, { status: 201 });
}
