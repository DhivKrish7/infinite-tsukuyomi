import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  ApiKeyInput,
  ApiKeyUpdateInput,
  BrandInput,
  DeskInput,
  IpRestrictionInput,
  PermissionGroupInput,
  UserUpdateInput
} from "../validation";

const actorSelect = { id: true, name: true, email: true };
const roleSelect = { id: true, name: true, description: true };

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  return value == null ? undefined : (value as Prisma.InputJsonValue);
}

export class ManagementRepository {
  listUsers(tenantId: string) {
    return prisma.user.findMany({
      where: { tenantId },
      include: {
        userRoles: { include: { role: { select: roleSelect } } },
        _count: { select: { refreshTokens: true, apiKeys: true, ipRestrictions: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  getUser(tenantId: string, id: string) {
    return prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        userRoles: { include: { role: { select: roleSelect } } },
        refreshTokens: { orderBy: { createdAt: "desc" }, take: 5 },
        apiKeys: { orderBy: { createdAt: "desc" }, take: 10 },
        ipRestrictions: { orderBy: { createdAt: "desc" }, take: 10 },
        _count: { select: { assignedClients: true, assignedLeads: true, auditLogs: true } }
      }
    });
  }

  listRoles() {
    return prisma.role.findMany({ select: roleSelect, orderBy: { name: "asc" } });
  }

  async updateUser(tenantId: string, id: string, data: UserUpdateInput) {
    return prisma.$transaction(async (tx) => {
      if (data.roleIds) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        if (data.roleIds.length) {
          await tx.userRole.createMany({
            data: data.roleIds.map((roleId) => ({ userId: id, roleId })),
            skipDuplicates: true
          });
        }
      }

      return tx.user.update({
        where: { id },
        data: {
          name: data.name,
          isActive: data.isActive
        },
        include: {
          userRoles: { include: { role: { select: roleSelect } } },
          _count: { select: { refreshTokens: true, apiKeys: true, ipRestrictions: true } }
        }
      });
    });
  }

  listApiKeys(tenantId: string) {
    return prisma.apiKey.findMany({
      where: { tenantId },
      include: {
        user: { select: actorSelect },
        createdBy: { select: actorSelect }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  getApiKey(tenantId: string, id: string) {
    return prisma.apiKey.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: actorSelect },
        createdBy: { select: actorSelect }
      }
    });
  }

  createApiKey(
    tenantId: string,
    actorId: string,
    data: ApiKeyInput,
    keyMaterial: { keyPrefix: string; keyHash: string }
  ) {
    return prisma.apiKey.create({
      data: {
        tenantId,
        createdById: actorId,
        userId: data.userId,
        name: data.name,
        keyPrefix: keyMaterial.keyPrefix,
        keyHash: keyMaterial.keyHash,
        scopes: toJson(data.scopes),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      },
      include: {
        user: { select: actorSelect },
        createdBy: { select: actorSelect }
      }
    });
  }

  updateApiKey(tenantId: string, id: string, data: ApiKeyUpdateInput) {
    return prisma.apiKey.update({
      where: { id },
      data: {
        name: data.name,
        scopes: data.scopes ? toJson(data.scopes) : undefined,
        status: data.status,
        expiresAt: data.expiresAt === undefined ? undefined : data.expiresAt ? new Date(data.expiresAt) : null,
        revokedAt: data.status === "REVOKED" ? new Date() : undefined
      },
      include: {
        user: { select: actorSelect },
        createdBy: { select: actorSelect }
      }
    });
  }

  listIpRestrictions(tenantId: string) {
    return prisma.ipRestriction.findMany({
      where: { tenantId },
      include: {
        user: { select: actorSelect },
        createdBy: { select: actorSelect }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  getIpRestriction(tenantId: string, id: string) {
    return prisma.ipRestriction.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: actorSelect },
        createdBy: { select: actorSelect }
      }
    });
  }

  createIpRestriction(tenantId: string, actorId: string, data: IpRestrictionInput) {
    return prisma.ipRestriction.create({
      data: {
        tenantId,
        createdById: actorId,
        userId: data.userId ?? null,
        label: data.label,
        cidr: data.cidr,
        mode: data.mode,
        status: data.status,
        notes: data.notes
      },
      include: {
        user: { select: actorSelect },
        createdBy: { select: actorSelect }
      }
    });
  }

  updateIpRestriction(tenantId: string, id: string, data: IpRestrictionInput) {
    return prisma.ipRestriction.update({
      where: { id },
      data: {
        tenantId,
        userId: data.userId ?? null,
        label: data.label,
        cidr: data.cidr,
        mode: data.mode,
        status: data.status,
        notes: data.notes
      },
      include: {
        user: { select: actorSelect },
        createdBy: { select: actorSelect }
      }
    });
  }

  listBrands(tenantId: string) {
    return prisma.brand.findMany({
      where: { tenantId },
      include: {
        createdBy: { select: actorSelect },
        _count: { select: { desks: true, permissionGroups: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  getBrand(tenantId: string, id: string) {
    return prisma.brand.findFirst({
      where: { id, tenantId },
      include: {
        createdBy: { select: actorSelect },
        _count: { select: { desks: true, permissionGroups: true } }
      }
    });
  }

  createBrand(tenantId: string, actorId: string, data: BrandInput) {
    return prisma.brand.create({
      data: {
        tenantId,
        createdById: actorId,
        ...data,
        settings: toJson(data.settings)
      },
      include: {
        createdBy: { select: actorSelect },
        _count: { select: { desks: true, permissionGroups: true } }
      }
    });
  }

  updateBrand(tenantId: string, id: string, data: BrandInput) {
    return prisma.brand.update({
      where: { id },
      data: {
        ...data,
        tenantId,
        settings: toJson(data.settings)
      },
      include: {
        createdBy: { select: actorSelect },
        _count: { select: { desks: true, permissionGroups: true } }
      }
    });
  }

  listDesks(tenantId: string) {
    return prisma.desk.findMany({
      where: { tenantId },
      include: {
        brand: { select: { id: true, name: true, slug: true, status: true } },
        createdBy: { select: actorSelect },
        _count: { select: { permissionGroups: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  getDesk(tenantId: string, id: string) {
    return prisma.desk.findFirst({
      where: { id, tenantId },
      include: {
        brand: { select: { id: true, name: true, slug: true, status: true } },
        createdBy: { select: actorSelect },
        _count: { select: { permissionGroups: true } }
      }
    });
  }

  createDesk(tenantId: string, actorId: string, data: DeskInput) {
    return prisma.desk.create({
      data: {
        tenantId,
        createdById: actorId,
        ...data,
        brandId: data.brandId ?? undefined,
        settings: toJson(data.settings)
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, status: true } },
        createdBy: { select: actorSelect },
        _count: { select: { permissionGroups: true } }
      }
    });
  }

  updateDesk(tenantId: string, id: string, data: DeskInput) {
    return prisma.desk.update({
      where: { id },
      data: {
        ...data,
        tenantId,
        brandId: data.brandId ?? null,
        settings: toJson(data.settings)
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, status: true } },
        createdBy: { select: actorSelect },
        _count: { select: { permissionGroups: true } }
      }
    });
  }

  listPermissionGroups(tenantId: string) {
    return prisma.permissionGroup.findMany({
      where: { tenantId },
      include: {
        brand: { select: { id: true, name: true, slug: true, status: true } },
        desk: { select: { id: true, name: true, slug: true, status: true } },
        createdBy: { select: actorSelect }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  getPermissionGroup(tenantId: string, id: string) {
    return prisma.permissionGroup.findFirst({
      where: { id, tenantId },
      include: {
        brand: { select: { id: true, name: true, slug: true, status: true } },
        desk: { select: { id: true, name: true, slug: true, status: true } },
        createdBy: { select: actorSelect }
      }
    });
  }

  createPermissionGroup(tenantId: string, actorId: string, data: PermissionGroupInput) {
    return prisma.permissionGroup.create({
      data: {
        tenantId,
        createdById: actorId,
        ...data,
        brandId: data.brandId ?? undefined,
        deskId: data.deskId ?? undefined,
        permissions: toJson(data.permissions),
        settings: toJson(data.settings)
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, status: true } },
        desk: { select: { id: true, name: true, slug: true, status: true } },
        createdBy: { select: actorSelect }
      }
    });
  }

  updatePermissionGroup(tenantId: string, id: string, data: PermissionGroupInput) {
    return prisma.permissionGroup.update({
      where: { id },
      data: {
        ...data,
        tenantId,
        brandId: data.brandId ?? null,
        deskId: data.deskId ?? null,
        permissions: toJson(data.permissions),
        settings: toJson(data.settings)
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, status: true } },
        desk: { select: { id: true, name: true, slug: true, status: true } },
        createdBy: { select: actorSelect }
      }
    });
  }

  listRecentChanges(tenantId: string) {
    return prisma.adminChangeLog.findMany({
      where: { tenantId },
      include: { actor: { select: actorSelect } },
      orderBy: { createdAt: "desc" },
      take: 8
    });
  }

  countAdminChanges(tenantId: string) {
    return prisma.adminChangeLog.count({ where: { tenantId } });
  }

  writeChangeLog(input: {
    tenantId: string;
    actorId: string;
    action: string;
    entity: string;
    entityId?: string;
    brandId?: string | null;
    deskId?: string | null;
    permissionGroupId?: string | null;
    before?: unknown;
    after?: unknown;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return prisma.adminChangeLog.create({
      data: {
        ...input,
        before: toJson(input.before),
        after: toJson(input.after),
        metadata: toJson(input.metadata)
      }
    });
  }
}

export const managementRepository = new ManagementRepository();
