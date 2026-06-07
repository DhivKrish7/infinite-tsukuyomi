import { createHash, randomBytes } from "crypto";
import type { ManagementUser } from "./auth";
import { managementRepository } from "./repositories";
import {
  serializeAdminChangeLog,
  serializeApiKey,
  serializeBrand,
  serializeDesk,
  serializeIpRestriction,
  serializePermissionGroup,
  serializeRole,
  serializeUser
} from "./serializers";
import type {
  ApiKeyInput,
  ApiKeyUpdateInput,
  BrandInput,
  DeskInput,
  IpRestrictionInput,
  PermissionGroupInput,
  UserUpdateInput
} from "../validation";

function hashApiKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createPlainApiKey() {
  const secret = randomBytes(32).toString("base64url");
  return `nx_live_${secret}`;
}

export class ManagementService {
  async getOverview(user: ManagementUser) {
    const [brands, desks, permissionGroups, users, apiKeys, ipRestrictions, recentChanges, adminChanges] = await Promise.all([
      managementRepository.listBrands(user.tenantId),
      managementRepository.listDesks(user.tenantId),
      managementRepository.listPermissionGroups(user.tenantId),
      managementRepository.listUsers(user.tenantId),
      managementRepository.listApiKeys(user.tenantId),
      managementRepository.listIpRestrictions(user.tenantId),
      managementRepository.listRecentChanges(user.tenantId),
      managementRepository.countAdminChanges(user.tenantId)
    ]);

    return {
      metrics: {
        brands: brands.length,
        desks: desks.length,
        permissionGroups: permissionGroups.length,
        users: users.length,
        apiUsers: new Set(apiKeys.map((key) => key.userId)).size,
        ipRestrictions: ipRestrictions.length,
        adminChanges
      },
      brands: brands.map(serializeBrand),
      desks: desks.map(serializeDesk),
      permissionGroups: permissionGroups.map(serializePermissionGroup),
      users: users.map(serializeUser),
      apiKeys: apiKeys.map(serializeApiKey),
      ipRestrictions: ipRestrictions.map(serializeIpRestriction),
      recentChanges: recentChanges.map(serializeAdminChangeLog)
    };
  }

  async listUsers(user: ManagementUser) {
    const [users, roles] = await Promise.all([
      managementRepository.listUsers(user.tenantId),
      managementRepository.listRoles()
    ]);

    return { items: users.map(serializeUser), roles: roles.map(serializeRole) };
  }

  async getUser(user: ManagementUser, id: string) {
    const record = await managementRepository.getUser(user.tenantId, id);
    return record ? { item: serializeUser(record) } : null;
  }

  async updateUser(user: ManagementUser, id: string, data: UserUpdateInput, ipAddress?: string) {
    const before = await managementRepository.getUser(user.tenantId, id);
    if (!before) return null;

    const record = await managementRepository.updateUser(user.tenantId, id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_USER_UPDATED",
      entity: "User",
      entityId: record.id,
      before: serializeUser(before),
      after: serializeUser(record),
      ipAddress
    });

    return { item: serializeUser(record) };
  }

  async listApiKeys(user: ManagementUser) {
    const keys = await managementRepository.listApiKeys(user.tenantId);
    return { items: keys.map(serializeApiKey) };
  }

  async createApiKey(user: ManagementUser, data: ApiKeyInput, ipAddress?: string) {
    const plainKey = createPlainApiKey();
    const keyPrefix = plainKey.slice(0, 16);
    const key = await managementRepository.createApiKey(user.tenantId, user.id, data, {
      keyPrefix,
      keyHash: hashApiKey(plainKey)
    });

    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_API_KEY_CREATED",
      entity: "ApiKey",
      entityId: key.id,
      after: serializeApiKey(key),
      ipAddress
    });

    return { item: serializeApiKey(key), secret: plainKey };
  }

  async updateApiKey(user: ManagementUser, id: string, data: ApiKeyUpdateInput, ipAddress?: string) {
    const before = await managementRepository.getApiKey(user.tenantId, id);
    if (!before) return null;

    const key = await managementRepository.updateApiKey(user.tenantId, id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: data.status === "REVOKED" ? "MANAGEMENT_API_KEY_REVOKED" : "MANAGEMENT_API_KEY_UPDATED",
      entity: "ApiKey",
      entityId: key.id,
      before: serializeApiKey(before),
      after: serializeApiKey(key),
      ipAddress
    });

    return { item: serializeApiKey(key) };
  }

  async listIpRestrictions(user: ManagementUser) {
    const rules = await managementRepository.listIpRestrictions(user.tenantId);
    return { items: rules.map(serializeIpRestriction) };
  }

  async createIpRestriction(user: ManagementUser, data: IpRestrictionInput, ipAddress?: string) {
    const rule = await managementRepository.createIpRestriction(user.tenantId, user.id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_IP_RESTRICTION_CREATED",
      entity: "IpRestriction",
      entityId: rule.id,
      after: serializeIpRestriction(rule),
      ipAddress
    });

    return { item: serializeIpRestriction(rule) };
  }

  async updateIpRestriction(user: ManagementUser, id: string, data: IpRestrictionInput, ipAddress?: string) {
    const before = await managementRepository.getIpRestriction(user.tenantId, id);
    if (!before) return null;

    const rule = await managementRepository.updateIpRestriction(user.tenantId, id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_IP_RESTRICTION_UPDATED",
      entity: "IpRestriction",
      entityId: rule.id,
      before: serializeIpRestriction(before),
      after: serializeIpRestriction(rule),
      ipAddress
    });

    return { item: serializeIpRestriction(rule) };
  }

  async listBrands(user: ManagementUser) {
    const brands = await managementRepository.listBrands(user.tenantId);
    return { items: brands.map(serializeBrand) };
  }

  async createBrand(user: ManagementUser, data: BrandInput, ipAddress?: string) {
    const brand = await managementRepository.createBrand(user.tenantId, user.id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_BRAND_CREATED",
      entity: "Brand",
      entityId: brand.id,
      brandId: brand.id,
      after: serializeBrand(brand),
      ipAddress
    });

    return { item: serializeBrand(brand) };
  }

  async updateBrand(user: ManagementUser, id: string, data: BrandInput, ipAddress?: string) {
    const before = await managementRepository.getBrand(user.tenantId, id);
    if (!before) return null;

    const brand = await managementRepository.updateBrand(user.tenantId, id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_BRAND_UPDATED",
      entity: "Brand",
      entityId: brand.id,
      brandId: brand.id,
      before: serializeBrand(before),
      after: serializeBrand(brand),
      ipAddress
    });

    return { item: serializeBrand(brand) };
  }

  async listDesks(user: ManagementUser) {
    const desks = await managementRepository.listDesks(user.tenantId);
    return { items: desks.map(serializeDesk) };
  }

  async createDesk(user: ManagementUser, data: DeskInput, ipAddress?: string) {
    const desk = await managementRepository.createDesk(user.tenantId, user.id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_DESK_CREATED",
      entity: "Desk",
      entityId: desk.id,
      brandId: desk.brandId,
      deskId: desk.id,
      after: serializeDesk(desk),
      ipAddress
    });

    return { item: serializeDesk(desk) };
  }

  async updateDesk(user: ManagementUser, id: string, data: DeskInput, ipAddress?: string) {
    const before = await managementRepository.getDesk(user.tenantId, id);
    if (!before) return null;

    const desk = await managementRepository.updateDesk(user.tenantId, id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_DESK_UPDATED",
      entity: "Desk",
      entityId: desk.id,
      brandId: desk.brandId,
      deskId: desk.id,
      before: serializeDesk(before),
      after: serializeDesk(desk),
      ipAddress
    });

    return { item: serializeDesk(desk) };
  }

  async listPermissionGroups(user: ManagementUser) {
    const groups = await managementRepository.listPermissionGroups(user.tenantId);
    return { items: groups.map(serializePermissionGroup) };
  }

  async createPermissionGroup(user: ManagementUser, data: PermissionGroupInput, ipAddress?: string) {
    const group = await managementRepository.createPermissionGroup(user.tenantId, user.id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_PERMISSION_GROUP_CREATED",
      entity: "PermissionGroup",
      entityId: group.id,
      brandId: group.brandId,
      deskId: group.deskId,
      permissionGroupId: group.id,
      after: serializePermissionGroup(group),
      ipAddress
    });

    return { item: serializePermissionGroup(group) };
  }

  async updatePermissionGroup(user: ManagementUser, id: string, data: PermissionGroupInput, ipAddress?: string) {
    const before = await managementRepository.getPermissionGroup(user.tenantId, id);
    if (!before) return null;

    const group = await managementRepository.updatePermissionGroup(user.tenantId, id, data);
    await managementRepository.writeChangeLog({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "MANAGEMENT_PERMISSION_GROUP_UPDATED",
      entity: "PermissionGroup",
      entityId: group.id,
      brandId: group.brandId,
      deskId: group.deskId,
      permissionGroupId: group.id,
      before: serializePermissionGroup(before),
      after: serializePermissionGroup(group),
      ipAddress
    });

    return { item: serializePermissionGroup(group) };
  }
}

export const managementService = new ManagementService();
