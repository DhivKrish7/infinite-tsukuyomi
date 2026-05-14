import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { triggerBrokerSyncSchema } from "@/server/broker-integrations/api/validation";
import { brokerSyncOrchestrator } from "@/server/broker-integrations/sync/sync-orchestrator";

export async function POST(request: NextRequest, { params }: { params: Promise<{ connectionId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = triggerBrokerSyncSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid sync payload" }, { status: 400 });
  }

  const { connectionId } = await params;
  const result = await brokerSyncOrchestrator.syncConnection({
    tenantId: user.tenantId,
    connectionId,
    types: parsed.data.types
  });

  return NextResponse.json({ result });
}
