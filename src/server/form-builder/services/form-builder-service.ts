import { DynamicFormKind, DynamicFormStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DynamicFormDefinition } from "@/features/form-builder/types";

type CreateFormInput = {
  tenantId: string;
  actorId?: string;
  name: string;
  key?: string;
  description?: string;
  kind: DynamicFormKind;
  definition: DynamicFormDefinition;
};

type CreateVersionInput = {
  tenantId: string;
  actorId?: string;
  formId: string;
  definition: DynamicFormDefinition;
  notes?: string;
  status?: DynamicFormStatus;
};

const formInclude = {
  currentVersion: true,
  versions: { orderBy: { version: "desc" as const }, take: 8 }
};

export class FormBuilderService {
  async getOverview(tenantId: string) {
    const forms = await prisma.dynamicForm.findMany({
      where: { tenantId },
      include: formInclude,
      orderBy: [{ kind: "asc" }, { updatedAt: "desc" }]
    });

    return { forms };
  }

  async createForm(input: CreateFormInput) {
    const key = input.key?.trim() || slugify(input.name);

    return prisma.$transaction(async (tx) => {
      const form = await tx.dynamicForm.create({
        data: {
          tenantId: input.tenantId,
          key,
          name: input.name,
          description: input.description,
          kind: input.kind,
          status: DynamicFormStatus.DRAFT,
          createdById: input.actorId
        }
      });

      const version = await tx.dynamicFormVersion.create({
        data: {
          tenantId: input.tenantId,
          formId: form.id,
          version: 1,
          definition: normalizeDefinition(input.definition) as Prisma.InputJsonValue,
          createdById: input.actorId
        }
      });

      return tx.dynamicForm.update({
        where: { id: form.id },
        data: { currentVersionId: version.id },
        include: formInclude
      });
    });
  }

  async createVersion(input: CreateVersionInput) {
    const form = await prisma.dynamicForm.findFirstOrThrow({
      where: { id: input.formId, tenantId: input.tenantId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } }
    });
    const nextVersion = (form.versions[0]?.version ?? 0) + 1;

    return prisma.$transaction(async (tx) => {
      const version = await tx.dynamicFormVersion.create({
        data: {
          tenantId: input.tenantId,
          formId: input.formId,
          version: nextVersion,
          definition: normalizeDefinition(input.definition) as Prisma.InputJsonValue,
          notes: input.notes,
          createdById: input.actorId,
          publishedAt: input.status === DynamicFormStatus.PUBLISHED ? new Date() : undefined
        }
      });

      return tx.dynamicForm.update({
        where: { id: form.id },
        data: {
          currentVersionId: version.id,
          status: input.status ?? form.status
        },
        include: formInclude
      });
    });
  }

  async publishForm(tenantId: string, formId: string) {
    const form = await prisma.dynamicForm.findFirstOrThrow({
      where: { id: formId, tenantId },
      include: { currentVersion: true }
    });

    if (!form.currentVersion) {
      throw new Error("Form has no version to publish");
    }

    await prisma.dynamicFormVersion.update({
      where: { id: form.currentVersion.id },
      data: { publishedAt: new Date() }
    });

    return prisma.dynamicForm.update({
      where: { id: form.id },
      data: { status: DynamicFormStatus.PUBLISHED },
      include: formInclude
    });
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeDefinition(definition: DynamicFormDefinition): DynamicFormDefinition {
  return {
    submitLabel: definition.submitLabel || "Submit",
    successMessage: definition.successMessage || "Form submitted.",
    fields: [...(definition.fields ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((field, index) => ({
        ...field,
        id: field.id || `${field.key}-${index + 1}`,
        key: field.key || slugify(field.label),
        required: Boolean(field.required),
        order: index + 1,
        options: field.options?.filter(Boolean)
      }))
  };
}

export const formBuilderService = new FormBuilderService();
