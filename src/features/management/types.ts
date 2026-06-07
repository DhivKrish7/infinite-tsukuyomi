export type ManagementStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type ManagementActor = {
  id: string;
  name: string;
  email: string;
};

export type BrandRecord = {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl?: string | null;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: ManagementActor | null;
  _count?: {
    desks: number;
    permissionGroups: number;
  };
};

export type DeskRecord = {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  brand?: Pick<BrandRecord, "id" | "name" | "slug" | "status"> | null;
  createdBy?: ManagementActor | null;
  _count?: {
    permissionGroups: number;
  };
};

export type PermissionGroupRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  permissions?: string[] | null;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  brand?: Pick<BrandRecord, "id" | "name" | "slug" | "status"> | null;
  desk?: Pick<DeskRecord, "id" | "name" | "slug" | "status"> | null;
  createdBy?: ManagementActor | null;
};

export type RoleRecord = {
  id: string;
  name: string;
  description?: string | null;
};

export type ManagementUserRecord = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: RoleRecord[];
  _count?: Record<string, number>;
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  status: string;
  lastUsedAt?: string | null;
  lastUsedIp?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ManagementActor | null;
  createdBy?: ManagementActor | null;
};

export type IpRestrictionRecord = {
  id: string;
  label: string;
  cidr: string;
  mode: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ManagementActor | null;
  createdBy?: ManagementActor | null;
};

export type AdminChangeLogRecord = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: ManagementActor | null;
};

export type ManagementOverview = {
  metrics: {
    brands: number;
    desks: number;
    permissionGroups: number;
    users: number;
    apiUsers: number;
    ipRestrictions: number;
    adminChanges: number;
  };
  brands: BrandRecord[];
  desks: DeskRecord[];
  permissionGroups: PermissionGroupRecord[];
  users: ManagementUserRecord[];
  apiKeys: ApiKeyRecord[];
  ipRestrictions: IpRestrictionRecord[];
  recentChanges: AdminChangeLogRecord[];
};

export type ManagementListResponse<T> = {
  items: T[];
};

export type ManagementUsersResponse = ManagementListResponse<ManagementUserRecord> & {
  roles: RoleRecord[];
};
