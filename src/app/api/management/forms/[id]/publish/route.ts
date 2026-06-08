import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/api";
import { formBuilderService } from "@/server/form-builder/services/form-builder-service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const form = await formBuilderService.publishForm(auth.user.tenantId, id);
  return NextResponse.json(form);
}
