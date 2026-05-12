import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type CrmUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireCrmUser() {
  const user = await getCurrentUser();

  if (!user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user };
}

export function parseSearchParams<T>(
  request: NextRequest,
  parser: { safeParse: (value: Record<string, string>) => { success: true; data: T } | { success: false } }
) {
  const values = Object.fromEntries(request.nextUrl.searchParams.entries());
  return parser.safeParse(values);
}

export function paginationMeta(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1)
  };
}

export async function writeCrmAudit({
  tenantId,
  actorId,
  action,
  entity,
  entityId,
  metadata
}: {
  tenantId: string;
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      tenantId,
      actorId,
      action,
      entity,
      entityId,
      metadata
    }
  });
}

export function validationError() {
  return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
}

export function notFound(entity = "Record") {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}
