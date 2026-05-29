import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { brokerConnectionActionSchema } from "@/server/broker-integrations/api/validation";
import { brokerConnectionService } from "@/server/broker-integrations/services/broker-connection-service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ connectionId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = brokerConnectionActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid broker action payload" }, { status: 400 });
  }

  const { connectionId } = await params;

  if (parsed.data.action === "enable") {
    const connection = await brokerConnectionService.setEnabled(user.tenantId, connectionId, true);
    return NextResponse.json({ connection });
  }

  if (parsed.data.action === "disable") {
    const connection = await brokerConnectionService.setEnabled(user.tenantId, connectionId, false);
    return NextResponse.json({ connection });
  }

  if (parsed.data.action === "reconnect") {
    const result = await brokerConnectionService.reconnect(user.tenantId, connectionId);
    return NextResponse.json(result);
  }

  if (parsed.data.action === "simulate_outage") {
    const connection = await brokerConnectionService.setOutage(user.tenantId, connectionId, true);
    return NextResponse.json({ connection });
  }

  const connection = await brokerConnectionService.setOutage(user.tenantId, connectionId, false);
  return NextResponse.json({ connection });
}
