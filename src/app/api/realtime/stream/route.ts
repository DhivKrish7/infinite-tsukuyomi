import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { realtimeSimulationEngine } from "@/server/realtime/simulation-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let releaseTenant: (() => void) | undefined;
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      releaseTenant = realtimeSimulationEngine.attachTenant(user.tenantId);
      unsubscribe = realtimeSimulationEngine.subscribe(user.tenantId, send);
      heartbeat = setInterval(() => send({ type: "heartbeat", timestamp: new Date().toISOString() }), 20000);
    },
    cancel() {
      unsubscribe?.();
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
