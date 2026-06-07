import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/api";
import { ensureCrmExtensionModules } from "@/lib/crm/extensions";

export async function GET() {
  const auth = await requireCrmUser();
  if ("response" in auth) return auth.response;

  const items = await ensureCrmExtensionModules(auth.user.tenantId);
  return NextResponse.json({ items });
}
