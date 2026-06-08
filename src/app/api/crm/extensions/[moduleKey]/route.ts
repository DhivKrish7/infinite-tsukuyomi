import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmUser, validationError, writeCrmAudit } from "@/lib/crm/api";
import { crmExtensionModuleSchema } from "@/lib/crm/validation";
import { CRM_EXTENSION_MODULES, toJson } from "@/lib/crm/extensions";

type Params = { params: Promise<{ moduleKey: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const { moduleKey } = await params;
  const moduleDefinition = CRM_EXTENSION_MODULES.find((module) => module.key === moduleKey);
  if (!moduleDefinition) return NextResponse.json({ error: "Extension module not found" }, { status: 404 });

  const parsed = crmExtensionModuleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError();

  const item = await prisma.crmExtensionModule.upsert({
    where: {
      tenantId_key: {
        tenantId: auth.user.tenantId,
        key: moduleDefinition.key
      }
    },
    update: {
      isEnabled: parsed.data.isEnabled,
      settings: parsed.data.settings ? toJson(parsed.data.settings) : undefined
    },
    create: {
      tenantId: auth.user.tenantId,
      key: moduleDefinition.key,
      name: moduleDefinition.name,
      description: moduleDefinition.description,
      isEnabled: parsed.data.isEnabled,
      settings: parsed.data.settings ? toJson(parsed.data.settings) : undefined
    }
  });

  await writeCrmAudit({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    action: "CRM_EXTENSION_MODULE_UPDATED",
    entity: "crm_extension_module",
    entityId: item.id,
    metadata: { key: item.key, enabled: item.isEnabled }
  });

  return NextResponse.json({ item });
}
