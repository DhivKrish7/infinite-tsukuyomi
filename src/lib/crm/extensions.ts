import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const CRM_EXTENSION_MODULES = [
  {
    key: "saved-filters",
    name: "Saved Filters",
    description: "Reusable query criteria for CRM lists."
  },
  {
    key: "saved-views",
    name: "Saved Views",
    description: "Named layouts that combine filters, columns, sorting, and list presentation."
  },
  {
    key: "editable-columns",
    name: "Editable Columns",
    description: "Per-user column visibility, order, width, and pinning preferences."
  },
  {
    key: "custom-fields",
    name: "Custom Fields",
    description: "Tenant-scoped field definitions and values without altering client or lead tables."
  }
] as const;

export type CrmExtensionModuleKey = (typeof CRM_EXTENSION_MODULES)[number]["key"];

export function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function ensureCrmExtensionModules(tenantId: string) {
  await prisma.$transaction(
    CRM_EXTENSION_MODULES.map((module) =>
      prisma.crmExtensionModule.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key: module.key
          }
        },
        update: {
          name: module.name,
          description: module.description
        },
        create: {
          tenantId,
          key: module.key,
          name: module.name,
          description: module.description,
          isEnabled: false
        }
      })
    )
  );

  return prisma.crmExtensionModule.findMany({
    where: { tenantId },
    orderBy: { key: "asc" }
  });
}

export async function isCrmExtensionEnabled(tenantId: string, moduleKey: CrmExtensionModuleKey) {
  const module = await prisma.crmExtensionModule.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key: moduleKey
      }
    }
  });

  return Boolean(module?.isEnabled);
}
