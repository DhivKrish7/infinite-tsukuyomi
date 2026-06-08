import { DynamicFormKind } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireCrmUser, validationError } from "@/lib/crm/api";
import { formBuilderService } from "@/server/form-builder/services/form-builder-service";
import type { DynamicFormDefinition } from "@/features/form-builder/types";

export async function GET() {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const overview = await formBuilderService.getOverview(auth.user.tenantId);
  return NextResponse.json(overview);
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  if (!isCreatePayload(body)) return validationError();

  const form = await formBuilderService.createForm({
    tenantId: auth.user.tenantId,
    actorId: auth.user.id,
    name: body.name,
    key: body.key,
    description: body.description,
    kind: body.kind,
    definition: body.definition
  });

  return NextResponse.json(form, { status: 201 });
}

function isCreatePayload(value: unknown): value is {
  name: string;
  key?: string;
  description?: string;
  kind: DynamicFormKind;
  definition: DynamicFormDefinition;
} {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.name === "string" &&
    Object.values(DynamicFormKind).includes(payload.kind as DynamicFormKind) &&
    isDefinition(payload.definition)
  );
}

function isDefinition(value: unknown): value is DynamicFormDefinition {
  if (!value || typeof value !== "object") return false;
  const fields = (value as { fields?: unknown }).fields;
  return Array.isArray(fields);
}
