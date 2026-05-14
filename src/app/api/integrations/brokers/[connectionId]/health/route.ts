import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { brokerConnectionService } from "@/server/broker-integrations/services/broker-connection-service";

export async function POST(_: Request, { params }: { params: Promise<{ connectionId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { connectionId } = await params;
  const health = await brokerConnectionService.healthCheck(user.tenantId, connectionId);

  return NextResponse.json({ health });
}
