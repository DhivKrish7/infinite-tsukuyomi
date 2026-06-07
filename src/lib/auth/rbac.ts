export const ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SUPPORT: "SUPPORT",
  STAFF: "STAFF",
  COMPLIANCE_OFFICER: "COMPLIANCE_OFFICER",
  FINANCE_MANAGER: "FINANCE_MANAGER",
  SALES_AGENT: "SALES_AGENT",
  RETENTION_AGENT: "RETENTION_AGENT",
  IB_MANAGER: "IB_MANAGER",
  RISK_ANALYST: "RISK_ANALYST",
  AUDITOR: "AUDITOR"
} as const;

export type RoleName = (typeof ROLE)[keyof typeof ROLE];

export const PERMISSION = {
  CLIENTS_READ: "clients.read",
  CLIENTS_WRITE: "clients.write",
  LEADS_READ: "leads.read",
  LEADS_WRITE: "leads.write",
  KYC_REVIEW: "kyc.review",
  FINANCE_READ: "finance.read",
  WITHDRAWALS_APPROVE: "withdrawals.approve",
  PLATFORMS_MANAGE: "platforms.manage",
  USERS_MANAGE: "users.manage",
  AUDIT_READ: "audit.read",
  RISK_MANAGE: "risk.manage",
  ANALYTICS_READ: "analytics.read",
  MANAGEMENT_READ: "management.read",
  MANAGEMENT_WRITE: "management.write",
  BRANDS_MANAGE: "brands.manage",
  DESKS_MANAGE: "desks.manage",
  PERMISSION_GROUPS_MANAGE: "permission_groups.manage",
  ADMIN_CHANGE_LOGS_READ: "admin_change_logs.read"
} as const;

export type PermissionKey = (typeof PERMISSION)[keyof typeof PERMISSION];

export type AuthzSubject = {
  roles: string[];
  permissions: string[];
};

export function hasRole(subject: AuthzSubject | null | undefined, roles: string | string[]) {
  if (!subject) return false;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return subject.roles.includes(ROLE.SUPER_ADMIN) || allowedRoles.some((role) => subject.roles.includes(role));
}

export function hasPermission(subject: AuthzSubject | null | undefined, permissions: string | string[]) {
  if (!subject) return false;
  const allowedPermissions = Array.isArray(permissions) ? permissions : [permissions];
  return (
    subject.roles.includes(ROLE.SUPER_ADMIN) ||
    allowedPermissions.some((permission) => subject.permissions.includes(permission))
  );
}

export const routeRolePolicy: Record<string, string[]> = {
  "/admin": [ROLE.SUPER_ADMIN, ROLE.ADMIN],
  "/management": [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.MANAGER],
  "/settings": [ROLE.SUPER_ADMIN, ROLE.ADMIN],
  "/audit-logs": [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.AUDITOR],
  "/kyc": [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.COMPLIANCE_OFFICER],
  "/finance": [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.MANAGER, ROLE.FINANCE_MANAGER],
  "/risk": [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.RISK_ANALYST]
};

export const routePermissionPolicy = [
  { prefix: "/api/management/users", permissions: [PERMISSION.USERS_MANAGE] },
  { prefix: "/api/management/api-keys", permissions: [PERMISSION.USERS_MANAGE] },
  { prefix: "/api/management/ip-restrictions", permissions: [PERMISSION.USERS_MANAGE] },
  { prefix: "/api/management/brands", permissions: [PERMISSION.BRANDS_MANAGE] },
  { prefix: "/api/management/desks", permissions: [PERMISSION.DESKS_MANAGE] },
  { prefix: "/api/management/permission-groups", permissions: [PERMISSION.PERMISSION_GROUPS_MANAGE] },
  { prefix: "/api/management", permissions: [PERMISSION.MANAGEMENT_READ] },
  { prefix: "/api/analytics", permissions: [PERMISSION.ANALYTICS_READ] },
  { prefix: "/api/compliance", permissions: [PERMISSION.KYC_REVIEW] },
  { prefix: "/api/finance/transactions", permissions: [PERMISSION.FINANCE_READ, PERMISSION.WITHDRAWALS_APPROVE] },
  { prefix: "/api/finance", permissions: [PERMISSION.FINANCE_READ] },
  { prefix: "/api/integrations/brokers", permissions: [PERMISSION.PLATFORMS_MANAGE] },
  { prefix: "/api/crm/leads", permissions: [PERMISSION.LEADS_READ, PERMISSION.LEADS_WRITE] },
  { prefix: "/api/crm/clients", permissions: [PERMISSION.CLIENTS_READ, PERMISSION.CLIENTS_WRITE] },
  { prefix: "/api/crm", permissions: [PERMISSION.CLIENTS_READ, PERMISSION.LEADS_READ] },
  { prefix: "/analytics", permissions: [PERMISSION.ANALYTICS_READ] },
  { prefix: "/crm/extensions", permissions: [PERMISSION.CLIENTS_READ, PERMISSION.LEADS_READ] },
  { prefix: "/management", permissions: [PERMISSION.MANAGEMENT_READ] },
  { prefix: "/clients", permissions: [PERMISSION.CLIENTS_READ] },
  { prefix: "/leads", permissions: [PERMISSION.LEADS_READ] },
  { prefix: "/onboarding", permissions: [PERMISSION.LEADS_READ, PERMISSION.CLIENTS_READ] },
  { prefix: "/kyc", permissions: [PERMISSION.KYC_REVIEW] },
  { prefix: "/finance/approvals", permissions: [PERMISSION.WITHDRAWALS_APPROVE] },
  { prefix: "/finance/withdrawals", permissions: [PERMISSION.WITHDRAWALS_APPROVE] },
  { prefix: "/finance", permissions: [PERMISSION.FINANCE_READ] },
  { prefix: "/platforms", permissions: [PERMISSION.PLATFORMS_MANAGE] }
] satisfies Array<{ prefix: string; permissions: PermissionKey[] }>;
