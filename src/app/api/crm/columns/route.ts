import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmColumnPreferenceSchema, crmExtensionListSchema } from "@/lib/crm/validation";
import { isCrmExtensionEnabled } from "@/lib/crm/extensions";

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "editable-columns"))) return NextResponse.json({ items: [] });

  const parsed = crmExtensionListSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return validationError();

  const items = await prisma.crmColumnPreference.findMany({
    where: {
      tenantId: auth.user.tenantId,
      ownerId: auth.user.id,
      ...(parsed.data.target ? { target: parsed.data.target } : {})
    },
    orderBy: [{ target: "asc" }, { order: "asc" }, { label: "asc" }]
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "editable-columns"))) {
    return NextResponse.json({ error: "Editable columns module is disabled" }, { status: 409 });
  }

  const parsed = crmColumnPreferenceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmColumnPreference.upsert({
    where: {
      tenantId_ownerId_target_columnKey: {
        tenantId: auth.user.tenantId,
        ownerId: auth.user.id,
        target: parsed.data.target,
        columnKey: parsed.data.columnKey
      }
    },
    update: {
      label: parsed.data.label,
      visible: parsed.data.visible,
      order: parsed.data.order,
      width: parsed.data.width,
      pinned: parsed.data.pinned
    },
    create: {
      tenantId: auth.user.tenantId,
      ownerId: auth.user.id,
      moduleKey: parsed.data.moduleKey,
      target: parsed.data.target,
      columnKey: parsed.data.columnKey,
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
    action: "CRM_COLUMN_PREFERENCE_UPSERTED",
    entity: "crm_column_preference",
    entityId: item.id,
    metadata: { target: item.target, columnKey: item.columnKey }
  });

  return NextResponse.json({ item }, { status: 201 });
}
