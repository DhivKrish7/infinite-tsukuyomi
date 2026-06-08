import { DynamicFormStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, validationError } from "@/lib/crm/api";
import { formBuilderService } from "@/server/form-builder/services/form-builder-service";
import type { DynamicFormDefinition } from "@/features/form-builder/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  if (!isVersionPayload(body)) return validationError();

  const { id } = await params;
  const form = await formBuilderService.createVersion({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    formId: id,
    definition: body.definition,
    notes: body.notes,
    status: body.status
  });

  return NextResponse.json(form, { status: 201 });
}

function isVersionPayload(value: unknown): value is {
  definition: DynamicFormDefinition;
  notes?: string;
  status?: DynamicFormStatus;
} {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  const fields = (payload.definition as { fields?: unknown } | undefined)?.fields;
  return (
    Array.isArray(fields) &&
    (payload.status === undefined || Object.values(DynamicFormStatus).includes(payload.status as DynamicFormStatus))
  );
}
