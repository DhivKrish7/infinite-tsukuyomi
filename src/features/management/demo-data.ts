import type { ManagementOverview } from "./types";

const createdAt = new Date("2026-06-08T00:00:00.000Z").toISOString();

export const demoManagementOverview: ManagementOverview = {
  metrics: {
    brands: 2,
    desks: 3,
    permissionGroups: 4,
    users: 3,
    apiUsers: 1,
    ipRestrictions: 2,
    adminChanges: 1
  },
  brands: [
    {
      id: "brand-demo",
      name: "Demosite",
      slug: "demosite",
      status: "ACTIVE",
      logoUrl: null,
      settings: { defaultCurrency: "USD", source: "demo" },
      createdAt,
      updatedAt: createdAt,
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      _count: { desks: 2, permissionGroups: 3 }
    },
    {
      id: "brand-fxlive",
      name: "FXLive",
      slug: "fxlive",
      status: "ACTIVE",
      logoUrl: null,
      settings: { defaultCurrency: "EUR", source: "demo" },
      createdAt,
      updatedAt: createdAt,
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      _count: { desks: 1, permissionGroups: 1 }
    }
  ],
  desks: [
    {
      id: "desk-conversion",
      name: "Sales Conversion",
      slug: "sales-conversion",
      status: "ACTIVE",
      settings: { region: "EMEA" },
      createdAt,
      updatedAt: createdAt,
      brand: { id: "brand-demo", name: "Demosite", slug: "demosite", status: "ACTIVE" },
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      _count: { permissionGroups: 2 }
    },
    {
      id: "desk-retention",
      name: "Retention",
      slug: "retention",
      status: "ACTIVE",
      settings: { region: "Global" },
      createdAt,
      updatedAt: createdAt,
      brand: { id: "brand-demo", name: "Demosite", slug: "demosite", status: "ACTIVE" },
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      _count: { permissionGroups: 1 }
    },
    {
      id: "desk-backoffice",
      name: "Back Office",
      slug: "back-office",
      status: "ACTIVE",
      settings: { region: "Operations" },
      createdAt,
      updatedAt: createdAt,
      brand: { id: "brand-fxlive", name: "FXLive", slug: "fxlive", status: "ACTIVE" },
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      _count: { permissionGroups: 1 }
    }
  ],
  permissionGroups: [
    {
      id: "group-all",
      name: "All Permissions",
      slug: "all-permissions",
      description: "Full management access for administrators.",
      status: "ACTIVE",
      permissions: ["management.read", "management.write", "brands.manage", "desks.manage"],
      settings: { source: "demo" },
      createdAt,
      updatedAt: createdAt,
      brand: { id: "brand-demo", name: "Demosite", slug: "demosite", status: "ACTIVE" },
      desk: { id: "desk-backoffice", name: "Back Office", slug: "back-office", status: "ACTIVE" },
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" }
    },
    {
      id: "group-conversion",
      name: "Conversion Managers",
      slug: "conversion-managers",
      description: "Brand-scoped access for sales desk managers.",
      status: "ACTIVE",
      permissions: ["management.read", "desks.manage"],
      settings: { source: "demo" },
      createdAt,
      updatedAt: createdAt,
      brand: { id: "brand-demo", name: "Demosite", slug: "demosite", status: "ACTIVE" },
      desk: { id: "desk-conversion", name: "Sales Conversion", slug: "sales-conversion", status: "ACTIVE" },
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" }
    }
  ],
  users: [
    {
      id: "admin-demo",
      name: "Nexus Admin",
      email: "admin@nexuscrm.local",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: createdAt,
      createdAt,
      updatedAt: createdAt,
      roles: [{ id: "role-admin", name: "SUPER_ADMIN", description: "Full tenant administration" }],
      _count: { refreshTokens: 2, apiKeys: 1, ipRestrictions: 1 }
    },
    {
      id: "manager-demo",
      name: "Desk Manager",
      email: "manager@nexuscrm.local",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: createdAt,
      createdAt,
      updatedAt: createdAt,
      roles: [{ id: "role-manager", name: "MANAGER", description: "Operational management" }],
      _count: { refreshTokens: 1, apiKeys: 0, ipRestrictions: 0 }
    }
  ],
  apiKeys: [
    {
      id: "api-key-demo",
      name: "Reporting Sync",
      keyPrefix: "nx_live_demo_123",
      scopes: ["clients.read", "analytics.read"],
      status: "ACTIVE",
      lastUsedAt: createdAt,
      lastUsedIp: "203.0.113.10",
      expiresAt: null,
      revokedAt: null,
      createdAt,
      updatedAt: createdAt,
      user: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" }
    }
  ],
  ipRestrictions: [
    {
      id: "ip-rule-demo",
      label: "Back office VPN",
      cidr: "203.0.113.0/24",
      mode: "ALLOW",
      status: "ACTIVE",
      notes: "Tenant-wide administrative access range.",
      createdAt,
      updatedAt: createdAt,
      user: null,
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" }
    },
    {
      id: "ip-rule-user-demo",
      label: "Admin workstation",
      cidr: "198.51.100.25/32",
      mode: "ALLOW",
      status: "ACTIVE",
      notes: null,
      createdAt,
      updatedAt: createdAt,
      user: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      createdBy: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" }
    }
  ],
  recentChanges: [
    {
      id: "change-demo",
      action: "SEED_EXPANSION_FOUNDATION",
      entity: "ExpansionFoundation",
      entityId: "tenant-demo",
      metadata: { source: "demo" },
      createdAt,
      actor: { id: "admin-demo", name: "Nexus Admin", email: "admin@nexuscrm.local" }
    }
  ]
};
