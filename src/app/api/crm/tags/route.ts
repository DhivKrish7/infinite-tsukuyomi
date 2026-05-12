import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { createTagSchema } from "@/lib/crm/validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const items = await prisma.tag.findMany({
    where: { tenantId: auth.user.tenantId },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = createTagSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const tag = await prisma.tag.upsert({
    where: {
      tenantId_name: {
        tenantId: auth.user.tenantId,
        name: parsed.data.name
      }
    },
    update: { color: parsed.data.color },
    create: {
      tenantId: auth.user.tenantId,
      ...parsed.data
    }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_TAG_UPSERTED",
    entity: "tag",
    entityId: tag.id,
    metadata: { name: tag.name }
  });

  return NextResponse.json({ item: tag }, { status: 201 });
}
