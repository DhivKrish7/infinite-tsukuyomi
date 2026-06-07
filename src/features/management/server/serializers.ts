type JsonObject = Record<string, unknown>;
type ActorRow = { id: string; name: string; email: string };
type BrandRefRow = { id: string; name: string; slug: string; status: string };
type DeskRefRow = { id: string; name: string; slug: string; status: string };
type CountRow = { desks?: number; permissionGroups?: number };

type BrandRow = BrandRefRow & {
  logoUrl?: string | null;
  settings?: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: ActorRow | null;
  _count?: CountRow;
};

type DeskRow = DeskRefRow & {
  settings?: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
  brand?: BrandRefRow | null;
  createdBy?: ActorRow | null;
  _count?: CountRow;
};

type PermissionGroupRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  permissions?: unknown;
  settings?: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
  brand?: BrandRefRow | null;
  desk?: DeskRefRow | null;
  createdBy?: ActorRow | null;
};

type AdminChangeLogRow = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
  createdAt: Date | string;
  actor?: ActorRow | null;
};

type RoleRow = { id: string; name: string; description?: string | null };

type UserRow = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date | string | null;
  lastLoginAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  userRoles?: Array<{ role: RoleRow }>;
  refreshTokens?: Array<{
    id: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date | string;
    revokedAt?: Date | string | null;
    createdAt: Date | string;
  }>;
  apiKeys?: ApiKeyRow[];
  ipRestrictions?: IpRestrictionRow[];
  _count?: Record<string, number>;
};

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes?: unknown;
  status: string;
  lastUsedAt?: Date | string | null;
  lastUsedIp?: string | null;
  expiresAt?: Date | string | null;
  revokedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: ActorRow | null;
  createdBy?: ActorRow | null;
};

type IpRestrictionRow = {
  id: string;
  label: string;
  cidr: string;
  mode: string;
  status: string;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: ActorRow | null;
  createdBy?: ActorRow | null;
};

function serializeDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function serializeNullableDate(value?: Date | string | null) {
  return value ? serializeDate(value) : null;
}

function serializeJson(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : value;
}

function serializeActor(actor?: ActorRow | null) {
  return actor ? { id: actor.id, name: actor.name, email: actor.email } : null;
}

export function serializeBrand(brand: BrandRow) {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    status: brand.status,
    logoUrl: brand.logoUrl,
    settings: serializeJson(brand.settings),
    createdAt: serializeDate(brand.createdAt),
    updatedAt: serializeDate(brand.updatedAt),
    createdBy: serializeActor(brand.createdBy),
    _count: brand._count
  };
}

export function serializeDesk(desk: DeskRow) {
  return {
    id: desk.id,
    name: desk.name,
    slug: desk.slug,
    status: desk.status,
    settings: serializeJson(desk.settings),
    createdAt: serializeDate(desk.createdAt),
    updatedAt: serializeDate(desk.updatedAt),
    brand: desk.brand ? { id: desk.brand.id, name: desk.brand.name, slug: desk.brand.slug, status: desk.brand.status } : null,
    createdBy: serializeActor(desk.createdBy),
    _count: desk._count
  };
}

export function serializePermissionGroup(group: PermissionGroupRow) {
  return {
    id: group.id,
    name: group.name,
    slug: group.slug,
    description: group.description,
    status: group.status,
    permissions: Array.isArray(group.permissions) ? group.permissions.map(String) : null,
    settings: serializeJson(group.settings),
    createdAt: serializeDate(group.createdAt),
    updatedAt: serializeDate(group.updatedAt),
    brand: group.brand ? { id: group.brand.id, name: group.brand.name, slug: group.brand.slug, status: group.brand.status } : null,
    desk: group.desk ? { id: group.desk.id, name: group.desk.name, slug: group.desk.slug, status: group.desk.status } : null,
    createdBy: serializeActor(group.createdBy)
  };
}

export function serializeAdminChangeLog(change: AdminChangeLogRow) {
  return {
    id: change.id,
    action: change.action,
    entity: change.entity,
    entityId: change.entityId,
    metadata: serializeJson(change.metadata),
    createdAt: serializeDate(change.createdAt),
    actor: serializeActor(change.actor)
  };
}

export function serializeRole(role: RoleRow) {
  return {
    id: role.id,
    name: role.name,
    description: role.description
  };
}

export function serializeUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.isActive,
    failedLoginAttempts: user.failedLoginAttempts,
    lockedUntil: serializeNullableDate(user.lockedUntil),
    lastLoginAt: serializeNullableDate(user.lastLoginAt),
    createdAt: serializeDate(user.createdAt),
    updatedAt: serializeDate(user.updatedAt),
    roles: user.userRoles?.map((userRole) => serializeRole(userRole.role)) ?? [],
    refreshTokens:
      user.refreshTokens?.map((token) => ({
        id: token.id,
        userAgent: token.userAgent,
        ipAddress: token.ipAddress,
        expiresAt: serializeDate(token.expiresAt),
        revokedAt: serializeNullableDate(token.revokedAt),
        createdAt: serializeDate(token.createdAt)
      })) ?? [],
    apiKeys: user.apiKeys?.map(serializeApiKey) ?? [],
    ipRestrictions: user.ipRestrictions?.map(serializeIpRestriction) ?? [],
    _count: user._count
  };
}

export function serializeApiKey(key: ApiKeyRow) {
  return {
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    scopes: Array.isArray(key.scopes) ? key.scopes.map(String) : [],
    status: key.status,
    lastUsedAt: serializeNullableDate(key.lastUsedAt),
    lastUsedIp: key.lastUsedIp,
    expiresAt: serializeNullableDate(key.expiresAt),
    revokedAt: serializeNullableDate(key.revokedAt),
    createdAt: serializeDate(key.createdAt),
    updatedAt: serializeDate(key.updatedAt),
    user: serializeActor(key.user),
    createdBy: serializeActor(key.createdBy)
  };
}

export function serializeIpRestriction(rule: IpRestrictionRow) {
  return {
    id: rule.id,
    label: rule.label,
    cidr: rule.cidr,
    mode: rule.mode,
    status: rule.status,
    notes: rule.notes,
    createdAt: serializeDate(rule.createdAt),
    updatedAt: serializeDate(rule.updatedAt),
    user: serializeActor(rule.user),
    createdBy: serializeActor(rule.createdBy)
  };
}
