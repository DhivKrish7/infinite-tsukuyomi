import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmExtensionListSchema, crmSavedFilterSchema } from "@/lib/crm/validation";
import { isCrmExtensionEnabled, toJson } from "@/lib/crm/extensions";

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "saved-filters"))) return NextResponse.json({ items: [] });

  const parsed = crmExtensionListSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return validationError();

  const items = await prisma.crmSavedFilter.findMany({
    where: {
      tenantId: auth.user.tenantId,
      ...(parsed.data.target ? { target: parsed.data.target } : {}),
      OR: [{ ownerId: auth.user.id }, { isShared: true }]
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;
  if (!(await isCrmExtensionEnabled(auth.user.tenantId, "saved-filters"))) {
    return NextResponse.json({ error: "Saved filters module is disabled" }, { status: 409 });
  }

  const parsed = crmSavedFilterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmSavedFilter.create({
    data: {
      tenantId: auth.user.tenantId,
      ownerId: auth.user.id,
      moduleKey: parsed.data.moduleKey,
      target: parsed.data.target,
      name: parsed.data.name,
      criteria: toJson(parsed.data.criteria),
      isShared: parsed.data.isShared
    }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_SAVED_FILTER_CREATED",
    entity: "crm_saved_filter",
    entityId: item.id,
    metadata: { target: item.target, name: item.name }
  });

  return NextResponse.json({ item }, { status: 201 });
}
