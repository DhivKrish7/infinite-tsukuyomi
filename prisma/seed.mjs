import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const permissions = [
  "clients.read",
  "clients.write",
  "leads.read",
  "leads.write",
  "kyc.review",
  "finance.read",
  "withdrawals.approve",
  "platforms.manage",
  "users.manage",
  "audit.read",
  "risk.manage",
  "analytics.read"
];

const roles = {
  SUPER_ADMIN: permissions,
  ADMIN: permissions,
  STAFF: ["clients.read", "leads.read", "analytics.read"],
  COMPLIANCE_OFFICER: ["clients.read", "kyc.review", "audit.read"],
  FINANCE_MANAGER: ["clients.read", "finance.read", "withdrawals.approve", "audit.read"],
  SALES_AGENT: ["clients.read", "clients.write", "leads.read", "leads.write"],
  RETENTION_AGENT: ["clients.read", "clients.write"],
  IB_MANAGER: ["clients.read", "finance.read", "analytics.read"],
  RISK_ANALYST: ["clients.read", "risk.manage", "audit.read"],
  AUDITOR: ["clients.read", "audit.read", "analytics.read"]
};

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "NexusCRM Default Brokerage",
      slug: "default"
    }
  });

  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key }
    });
  }

  for (const [name, rolePermissions] of Object.entries(roles)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name.replaceAll("_", " ")} role` }
    });

    const permissionRows = await prisma.permission.findMany({
      where: { key: { in: rolePermissions } }
    });

    for (const permission of permissionRows) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@nexuscrm.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe_StrongPassword123!";
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });

  const user = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email,
      name: "Nexus Admin",
      passwordHash: await bcrypt.hash(password, 12)
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id
    }
  });

  console.log(`Seeded default tenant and admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
