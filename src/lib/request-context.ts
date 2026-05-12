import type { NextRequest } from "next/server";

export function getRequestContext(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown";

  return {
    ipAddress,
    userAgent: request.headers.get("user-agent") ?? "unknown"
  };
}
