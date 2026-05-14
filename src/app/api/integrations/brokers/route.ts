import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createBrokerConnectionSchema } from "@/server/broker-integrations/api/validation";
import { brokerConnectionService } from "@/server/broker-integrations/services/broker-connection-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [adapters, connections] = await Promise.all([
    brokerConnectionService.listAdapters(),
    brokerConnectionService.listConnections(user.tenantId)
  ]);

  return NextResponse.json({ adapters, connections });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createBrokerConnectionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid broker connection payload" }, { status: 400 });
  }

  const connection = await brokerConnectionService.createConnection({
    tenantId: user.tenantId,
    ...parsed.data
  });

  return NextResponse.json({ connection }, { status: 201 });
}
