import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmExtensionListSchema, crmSavedViewSchema } from "@/lib/crm/validation";
import { isCrmExtensionEnabled, toJson } from "@/lib/crm/extensions";

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "saved-views"))) return NextResponse.json({ items: [] });

  const parsed = crmExtensionListSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return validationError();

  const items = await prisma.crmSavedView.findMany({
    where: {
      tenantId: auth.user.tenantId,
      ...(parsed.data.target ? { target: parsed.data.target } : {}),
      OR: [{ ownerId: auth.user.id }, { isShared: true }]
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      filter: { select: { id: true, name: true } }
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "saved-views"))) {
    return NextResponse.json({ error: "Saved views module is disabled" }, { status: 409 });
  }

  const parsed = crmSavedViewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmSavedView.create({
    data: {
      tenantId: auth.user.tenantId,
      ownerId: auth.user.id,
      moduleKey: parsed.data.moduleKey,
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
    action: "CRM_SAVED_VIEW_CREATED",
    entity: "crm_saved_view",
    entityId: item.id,
    metadata: { target: item.target, name: item.name }
  });

  return NextResponse.json({ item }, { status: 201 });
}
