import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { brokerEventBus } from "@/server/broker-integrations/core/events";
import { realtimeSimulationEngine } from "@/server/realtime/simulation-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let releaseTenant: (() => void) | undefined;
  let unsubscribeBrokerEvents: (() => void) | undefined;
  let unsubscribeSimulationEvents: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      send({
        type: "notification.created",
        tenantId: user.tenantId,
        severity: "success",
        title: "Sandbox stream connected",
        message: "Mock broker websocket feed is running locally.",
        timestamp: new Date().toISOString()
      });

      releaseTenant = realtimeSimulationEngine.attachTenant(user.tenantId);
      unsubscribeBrokerEvents = brokerEventBus.subscribe(send, { tenantId: user.tenantId });
      unsubscribeSimulationEvents = realtimeSimulationEngine.subscribe(user.tenantId, send);
      heartbeat = setInterval(() => send({ type: "heartbeat", timestamp: new Date().toISOString() }), 20000);
    },
    cancel() {
      unsubscribeBrokerEvents?.();
      unsubscribeSimulationEvents?.();
      releaseTenant?.();
      if (heartbeat) clearInterval(heartbeat);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
