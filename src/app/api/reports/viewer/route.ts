import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCrmUser, validationError } from "@/lib/crm/api";
import { reportService } from "@/server/reports/report-service";

const viewerQuerySchema = z.object({
  type: z.enum(["CUSTOMER", "TRADE", "TRANSACTION"]).default("CUSTOMER")
});

export async function GET(request: NextRequest) {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const parsed = viewerQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return validationError();

  return NextResponse.json(await reportService.getViewer(auth.user.tenantId, parsed.data.type));
}
