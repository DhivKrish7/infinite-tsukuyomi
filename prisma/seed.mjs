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
  "analytics.read",
  "marketing.read",
  "marketing.write",
  "management.read",
  "management.write",
  "forms.manage",
  "brands.manage",
  "desks.manage",
  "permission_groups.manage",
  "admin_change_logs.read"
];

const roles = {
  SUPER_ADMIN: permissions,
  ADMIN: permissions,
  MANAGER: [
    "clients.read",
    "leads.read",
    "finance.read",
    "withdrawals.approve",
    "analytics.read",
    "marketing.read",
    "marketing.write",
    "audit.read",
    "management.read",
    "forms.manage",
    "admin_change_logs.read"
  ],
  SUPPORT: ["clients.read", "clients.write", "leads.read", "leads.write", "analytics.read", "marketing.read"],
  STAFF: ["clients.read", "leads.read", "analytics.read", "marketing.read"],
  COMPLIANCE_OFFICER: ["clients.read", "kyc.review", "audit.read"],
  FINANCE_MANAGER: ["clients.read", "finance.read", "withdrawals.approve", "audit.read"],
  SALES_AGENT: ["clients.read", "clients.write", "leads.read", "leads.write", "marketing.read"],
  RETENTION_AGENT: ["clients.read", "clients.write"],
  IB_MANAGER: ["clients.read", "finance.read", "analytics.read", "marketing.read"],
  RISK_ANALYST: ["clients.read", "risk.manage", "audit.read"],
  AUDITOR: ["clients.read", "audit.read", "analytics.read", "admin_change_logs.read"]
};

const now = new Date();
const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const minutesAgo = (minutes) => new Date(now.getTime() - minutes * 60 * 1000);

const demoPlatforms = [
  {
    key: "nebulafx",
    name: "NebulaFX",
    type: "MT5 + MT4",
    adapterKey: "mock.nebulafx",
    displayName: "NebulaFX Sandbox",
    credentials: { apiKey: "sandbox-nebulafx-key", environment: "sandbox" },
    settings: { latencyMs: 180, simulateOutage: false, priceFeed: true }
  },
  {
    key: "squidmarkets",
    name: "SquidMarkets",
    type: "cTrader",
    adapterKey: "mock.squidmarkets",
    displayName: "SquidMarkets Sandbox",
    credentials: { clientId: "sandbox-squidmarkets-client", environment: "sandbox" },
    settings: { latencyMs: 240, simulateOutage: false, priceFeed: true }
  }
];

const demoClients = [
  {
    externalId: "client-marcus",
    name: "Marcus Reid",
    email: "marcus.reid@nexusdemo.local",
    phone: "+44 7700 900101",
    country: "United Kingdom",
    platformKey: "nebulafx",
    status: "ACTIVE",
    onboardingStage: "ACTIVE_TRADER",
    kycStatus: "VERIFIED",
    riskLevel: "LOW",
    login: "10482",
    balance: "84200.00",
    equity: "88320.00",
    margin: "12000.00"
  },
  {
    externalId: "client-aiko",
    name: "Aiko Yamamoto",
    email: "aiko.yamamoto@nexusdemo.local",
    phone: "+81 90 1000 2048",
    country: "Japan",
    platformKey: "nebulafx",
    status: "ACTIVE",
    onboardingStage: "ACTIVE_TRADER",
    kycStatus: "VERIFIED",
    riskLevel: "MEDIUM",
    login: "11001",
    balance: "220000.00",
    equity: "238400.00",
    margin: "44000.00"
  },
  {
    externalId: "client-liam",
    name: "Liam Torres",
    email: "liam.torres@nexusdemo.local",
    phone: "+34 600 000 992",
    country: "Spain",
    platformKey: "nebulafx",
    status: "ACTIVE",
    onboardingStage: "FUNDED",
    kycStatus: "IN_REVIEW",
    riskLevel: "HIGH",
    login: "09921",
    balance: "12400.00",
    equity: "11840.00",
    margin: "5200.00"
  },
  {
    externalId: "client-priya",
    name: "Priya Kapoor",
    email: "priya.kapoor@nexusdemo.local",
    phone: "+91 90000 00214",
    country: "India",
    platformKey: "squidmarkets",
    status: "ACTIVE",
    onboardingStage: "ACTIVE_TRADER",
    kycStatus: "VERIFIED",
    riskLevel: "MEDIUM",
    login: "214",
    balance: "32000.00",
    equity: "33830.00",
    margin: "6200.00"
  },
  {
    externalId: "client-sophia",
    name: "Sophia Muller",
    email: "sophia.muller@nexusdemo.local",
    phone: "+49 151 0000 0388",
    country: "Germany",
    platformKey: "squidmarkets",
    status: "ACTIVE",
    onboardingStage: "ACTIVE_TRADER",
    kycStatus: "VERIFIED",
    riskLevel: "LOW",
    login: "388",
    balance: "8900.00",
    equity: "8760.00",
    margin: "5100.00"
  },
  {
    externalId: "client-chloe",
    name: "Chloe Martin",
    email: "chloe.martin@nexusdemo.local",
    phone: "+33 6 00 00 0177",
    country: "France",
    platformKey: "squidmarkets",
    status: "SUSPENDED",
    onboardingStage: "KYC_REVIEW",
    kycStatus: "FLAGGED",
    riskLevel: "CRITICAL",
    login: "177",
    balance: "14000.00",
    equity: "12100.00",
    margin: "9800.00"
  }
];

const demoTrades = [
  ["10482", "NX-T-9001", "EURUSD", "BUY", "1.20", "1.084200", null, "4120.00", 2],
  ["11001", "NX-T-9002", "GBPUSD", "SELL", "2.40", "1.271800", null, "18400.00", 1],
  ["09921", "NX-T-9003", "USDJPY", "SELL", "0.80", "156.420000", null, "-560.00", 3],
  ["214", "SQ-T-7001", "XAUUSD", "SELL", "0.50", "2370.250000", null, "-140.00", 1],
  ["214", "SQ-T-7002", "BTCUSD", "BUY", "0.18", "68420.500000", null, "1830.00", 2],
  ["388", "SQ-T-7003", "EURUSD", "BUY", "0.70", "1.079100", "1.083100", "280.00", 7],
  ["177", "SQ-T-7004", "US30", "SELL", "0.30", "39120.200000", null, "-1900.00", 1]
];

const demoTransactions = [
  ["SANDBOX-DEP-001", "marcus.reid@nexusdemo.local", "DEPOSIT", "COMPLETED", "5000.00", "35.00", "4965.00", "Bank Wire", 0.18, 2],
  ["SANDBOX-DEP-002", "aiko.yamamoto@nexusdemo.local", "DEPOSIT", "COMPLETED", "50000.00", "125.00", "49875.00", "Bank Wire", 0.22, 5],
  ["SANDBOX-WDR-001", "aiko.yamamoto@nexusdemo.local", "WITHDRAWAL", "PENDING", "12000.00", "30.00", "12030.00", "Bank Wire", 0.72, 1],
  ["SANDBOX-DEP-003", "priya.kapoor@nexusdemo.local", "DEPOSIT", "COMPLETED", "8000.00", "64.00", "7936.00", "Card", 0.12, 4],
  ["SANDBOX-WDR-002", "priya.kapoor@nexusdemo.local", "WITHDRAWAL", "PENDING", "800.00", "12.00", "812.00", "Bank Wire", 0.44, 0],
  ["SANDBOX-DEP-004", "sophia.muller@nexusdemo.local", "DEPOSIT", "COMPLETED", "2500.00", "25.00", "2475.00", "Card", 0.09, 3],
  ["SANDBOX-WDR-003", "chloe.martin@nexusdemo.local", "WITHDRAWAL", "REJECTED", "6000.00", "18.00", "6018.00", "Crypto", 0.96, 6]
];

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
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Password123!";
  const demoUsers = [
    {
      email,
      password,
      name: "Nexus Admin",
      role: "ADMIN"
    },
    {
      email: "manager@nexuscrm.local",
      password: "Password123!",
      name: "Maya Manager",
      role: "MANAGER"
    },
    {
      email: "support@nexuscrm.local",
      password: "Password123!",
      name: "Sam Support",
      role: "SUPPORT"
    }
  ];

  const demoUserRows = new Map();
  for (const demoUser of demoUsers) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: demoUser.role } });
    const user = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: demoUser.email
        }
      },
      update: {
        name: demoUser.name,
        passwordHash: await bcrypt.hash(demoUser.password, 12),
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null
      },
      create: {
        tenantId: tenant.id,
        email: demoUser.email,
        name: demoUser.name,
        passwordHash: await bcrypt.hash(demoUser.password, 12)
      }
    });

    await prisma.userRole.deleteMany({
      where: { userId: user.id }
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id
      }
    });

    demoUserRows.set(demoUser.role, user);
  }

  await seedExpansionFoundation(tenant.id, demoUserRows);
  await seedSandboxDemoData(tenant.id, demoUserRows);

  console.log("Seeded default tenant and demo users:");
  for (const demoUser of demoUsers) {
    console.log(`- ${demoUser.role}: ${demoUser.email}`);
  }
  console.log("Seeded sandbox brokerage simulation: clients, brokers, accounts, trades, funding, activity logs, and notifications.");
}

async function seedExpansionFoundation(tenantId, demoUserRows) {
  const admin = demoUserRows.get("ADMIN");

  const brand = await prisma.brand.upsert({
    where: {
      tenantId_slug: {
        tenantId,
        slug: "default"
      }
    },
    update: {
      name: "Default Brand",
      status: "ACTIVE",
      createdById: admin?.id,
      settings: { source: "seed", protected: true }
    },
    create: {
      tenantId,
      createdById: admin?.id,
      name: "Default Brand",
      slug: "default",
      status: "ACTIVE",
      settings: { source: "seed", protected: true }
    }
  });

  const desk = await prisma.desk.upsert({
    where: {
      tenantId_slug: {
        tenantId,
        slug: "default-sales"
      }
    },
    update: {
      brandId: brand.id,
      name: "Default Sales Desk",
      status: "ACTIVE",
      createdById: admin?.id,
      settings: { source: "seed", protected: true }
    },
    create: {
      tenantId,
      brandId: brand.id,
      createdById: admin?.id,
      name: "Default Sales Desk",
      slug: "default-sales",
      status: "ACTIVE",
      settings: { source: "seed", protected: true }
    }
  });

  const permissionGroup = await prisma.permissionGroup.upsert({
    where: {
      tenantId_slug: {
        tenantId,
        slug: "default-admin"
      }
    },
    update: {
      brandId: brand.id,
      deskId: desk.id,
      name: "Default Admin Group",
      status: "ACTIVE",
      createdById: admin?.id,
      permissions,
      settings: { source: "seed", protected: true }
    },
    create: {
      tenantId,
      brandId: brand.id,
      deskId: desk.id,
      createdById: admin?.id,
      name: "Default Admin Group",
      slug: "default-admin",
      description: "Seeded expansion foundation permission group.",
      status: "ACTIVE",
      permissions,
      settings: { source: "seed", protected: true }
    }
  });

  await prisma.adminChangeLog.upsert({
    where: { id: "seed-expansion-foundation" },
    update: {
      tenantId,
      actorId: admin?.id,
      brandId: brand.id,
      deskId: desk.id,
      permissionGroupId: permissionGroup.id,
      action: "SEED_EXPANSION_FOUNDATION",
      entity: "ExpansionFoundation",
      entityId: tenantId,
      after: {
        brandId: brand.id,
        deskId: desk.id,
        permissionGroupId: permissionGroup.id
      },
      metadata: { source: "seed" }
    },
    create: {
      id: "seed-expansion-foundation",
      tenantId,
      actorId: admin?.id,
      brandId: brand.id,
      deskId: desk.id,
      permissionGroupId: permissionGroup.id,
      action: "SEED_EXPANSION_FOUNDATION",
      entity: "ExpansionFoundation",
      entityId: tenantId,
      after: {
        brandId: brand.id,
        deskId: desk.id,
        permissionGroupId: permissionGroup.id
      },
      metadata: { source: "seed" }
    }
  });
}

async function seedSandboxDemoData(tenantId, demoUserRows) {
  const admin = demoUserRows.get("ADMIN");
  const manager = demoUserRows.get("MANAGER");
  const support = demoUserRows.get("SUPPORT");
  const platformByKey = new Map();
  const clientByEmail = new Map();
  const accountByLogin = new Map();

  await prisma.auditLog.deleteMany({ where: { tenantId, action: { startsWith: "SANDBOX_" } } });
  await prisma.communicationLog.deleteMany({ where: { tenantId, subject: "Sandbox workflow event" } });
  await prisma.brokerSyncRun.deleteMany({ where: { tenantId, cursorAfter: "sandbox-seed" } });
  await prisma.financeFee.deleteMany({ where: { tenantId, transaction: { reference: { startsWith: "SANDBOX-" } } } });
  await prisma.financeApproval.deleteMany({ where: { tenantId, transaction: { reference: { startsWith: "SANDBOX-" } } } });
  await prisma.suspiciousTransactionFlag.deleteMany({ where: { tenantId, transaction: { reference: { startsWith: "SANDBOX-" } } } });
  await prisma.ledgerEntry.deleteMany({ where: { tenantId, reference: { startsWith: "SANDBOX-" } } });
  await prisma.transaction.deleteMany({ where: { tenantId, reference: { startsWith: "SANDBOX-" } } });

  for (const platformConfig of demoPlatforms) {
    const platform = await prisma.tradingPlatform.upsert({
      where: { tenantId_name: { tenantId, name: platformConfig.name } },
      update: {
        type: platformConfig.type,
        isConnected: true,
        lastSyncAt: minutesAgo(4)
      },
      create: {
        tenantId,
        name: platformConfig.name,
        type: platformConfig.type,
        isConnected: true,
        lastSyncAt: minutesAgo(4)
      }
    });

    platformByKey.set(platformConfig.key, platform);

    await prisma.brokerConnection.upsert({
      where: {
        tenantId_adapterKey_displayName: {
          tenantId,
          adapterKey: platformConfig.adapterKey,
          displayName: platformConfig.displayName
        }
      },
      update: {
        platformId: platform.id,
        credentials: platformConfig.credentials,
        settings: platformConfig.settings,
        status: "CONNECTED",
        accountCursor: null,
        tradeCursor: null,
        transactionCursor: null,
        lastHeartbeatAt: minutesAgo(1),
        lastAccountSyncAt: minutesAgo(5),
        lastTradeSyncAt: minutesAgo(6),
        lastTransactionSyncAt: minutesAgo(7)
      },
      create: {
        tenantId,
        platformId: platform.id,
        adapterKey: platformConfig.adapterKey,
        displayName: platformConfig.displayName,
        credentials: platformConfig.credentials,
        settings: platformConfig.settings,
        status: "CONNECTED",
        lastHeartbeatAt: minutesAgo(1),
        lastAccountSyncAt: minutesAgo(5),
        lastTradeSyncAt: minutesAgo(6),
        lastTransactionSyncAt: minutesAgo(7)
      }
    });
  }

  for (const clientConfig of demoClients) {
    const platform = platformByKey.get(clientConfig.platformKey);
    const assignedToId =
      clientConfig.riskLevel === "CRITICAL" ? manager?.id : clientConfig.kycStatus === "IN_REVIEW" ? support?.id : admin?.id;

    const client = await prisma.client.upsert({
      where: {
        tenantId_email: {
          tenantId,
          email: clientConfig.email
        }
      },
      update: {
        platformId: platform.id,
        assignedToId,
        externalId: clientConfig.externalId,
        name: clientConfig.name,
        phone: clientConfig.phone,
        country: clientConfig.country,
        language: "en",
        status: clientConfig.status,
        onboardingStage: clientConfig.onboardingStage,
        kycStatus: clientConfig.kycStatus,
        riskLevel: clientConfig.riskLevel,
        lastContactedAt: minutesAgo(90),
        nextFollowUpAt: daysAgo(-1)
      },
      create: {
        tenantId,
        platformId: platform.id,
        assignedToId,
        externalId: clientConfig.externalId,
        name: clientConfig.name,
        email: clientConfig.email,
        phone: clientConfig.phone,
        country: clientConfig.country,
        language: "en",
        status: clientConfig.status,
        onboardingStage: clientConfig.onboardingStage,
        kycStatus: clientConfig.kycStatus,
        riskLevel: clientConfig.riskLevel,
        lastContactedAt: minutesAgo(90),
        nextFollowUpAt: daysAgo(-1)
      }
    });

    clientByEmail.set(clientConfig.email, client);

    const account = await prisma.tradingAccount.upsert({
      where: {
        platformId_login: {
          platformId: platform.id,
          login: clientConfig.login
        }
      },
      update: {
        clientId: client.id,
        currency: "USD",
        balance: clientConfig.balance,
        equity: clientConfig.equity,
        margin: clientConfig.margin
      },
      create: {
        clientId: client.id,
        platformId: platform.id,
        login: clientConfig.login,
        currency: "USD",
        balance: clientConfig.balance,
        equity: clientConfig.equity,
        margin: clientConfig.margin
      }
    });

    accountByLogin.set(clientConfig.login, account);

    await prisma.accountBalanceSnapshot.deleteMany({ where: { accountId: account.id } });
    for (const offset of [6, 4, 2, 0]) {
      const equityShift = (Number(clientConfig.equity) * (1 - offset * 0.006)).toFixed(2);
      await prisma.accountBalanceSnapshot.create({
        data: {
          accountId: account.id,
          balance: clientConfig.balance,
          equity: equityShift,
          margin: clientConfig.margin,
          freeMargin: (Number(equityShift) - Number(clientConfig.margin)).toFixed(2),
          credit: "0.00",
          currency: "USD",
          capturedAt: daysAgo(offset)
        }
      });
    }

    const wallet = await prisma.wallet.upsert({
      where: { id: `sandbox-wallet-${clientConfig.externalId}` },
      update: {
        clientId: client.id,
        status: clientConfig.status === "SUSPENDED" ? "FROZEN" : "ACTIVE",
        ledgerBalance: clientConfig.balance,
        availableBalance: (Number(clientConfig.balance) * 0.92).toFixed(2),
        holdBalance: (Number(clientConfig.balance) * 0.08).toFixed(2),
        lifetimeDeposits: (Number(clientConfig.balance) * 1.18).toFixed(2),
        lifetimeWithdrawals: (Number(clientConfig.balance) * 0.22).toFixed(2),
        providerReference: `wallet-${clientConfig.login}`
      },
      create: {
        id: `sandbox-wallet-${clientConfig.externalId}`,
        tenantId,
        clientId: client.id,
        type: "CLIENT",
        status: clientConfig.status === "SUSPENDED" ? "FROZEN" : "ACTIVE",
        currency: "USD",
        ledgerBalance: clientConfig.balance,
        availableBalance: (Number(clientConfig.balance) * 0.92).toFixed(2),
        holdBalance: (Number(clientConfig.balance) * 0.08).toFixed(2),
        lifetimeDeposits: (Number(clientConfig.balance) * 1.18).toFixed(2),
        lifetimeWithdrawals: (Number(clientConfig.balance) * 0.22).toFixed(2),
        providerReference: `wallet-${clientConfig.login}`
      }
    });

    await prisma.clientNote.upsert({
      where: { id: `sandbox-note-${clientConfig.externalId}` },
      update: {
        authorId: support?.id,
        body: `${clientConfig.name} is part of the local brokerage sandbox workflow.`,
        pinned: clientConfig.riskLevel === "HIGH" || clientConfig.riskLevel === "CRITICAL"
      },
      create: {
        id: `sandbox-note-${clientConfig.externalId}`,
        clientId: client.id,
        authorId: support?.id,
        body: `${clientConfig.name} is part of the local brokerage sandbox workflow.`,
        pinned: clientConfig.riskLevel === "HIGH" || clientConfig.riskLevel === "CRITICAL"
      }
    });

    await prisma.communicationLog.create({
      data: {
        tenantId,
        clientId: client.id,
        createdById: support?.id,
        type: "SYSTEM",
        direction: "INTERNAL",
        subject: "Sandbox workflow event",
        body: `Generated broker activity for ${clientConfig.name}.`,
        occurredAt: minutesAgo(30)
      }
    });
  }

  for (const [login, ticket, symbol, side, volume, openPrice, closePrice, pnl, openedDaysAgo] of demoTrades) {
    const account = accountByLogin.get(login);
    if (!account) continue;

    await prisma.trade.upsert({
      where: {
        accountId_ticket: {
          accountId: account.id,
          ticket
        }
      },
      update: {
        symbol,
        side,
        volume,
        openPrice,
        closePrice,
        pnl,
        openedAt: daysAgo(openedDaysAgo),
        closedAt: closePrice ? minutesAgo(45) : null
      },
      create: {
        accountId: account.id,
        ticket,
        symbol,
        side,
        volume,
        openPrice,
        closePrice,
        pnl,
        openedAt: daysAgo(openedDaysAgo),
        closedAt: closePrice ? minutesAgo(45) : undefined
      }
    });
  }

  for (const [reference, email, type, status, amount, feeAmount, netAmount, method, riskScore, requestedDaysAgo] of demoTransactions) {
    const client = clientByEmail.get(email);
    if (!client) continue;

    const wallet = await prisma.wallet.findFirst({ where: { tenantId, clientId: client.id, type: "CLIENT" } });
    const transaction = await prisma.transaction.create({
      data: {
        tenantId,
        clientId: client.id,
        walletId: wallet?.id,
        requestedById: manager?.id,
        processedById: status === "PENDING" ? null : admin?.id,
        type,
        status,
        amount,
        feeAmount,
        netAmount,
        currency: "USD",
        method,
        reference,
        gatewayReference: `MOCK-${reference}`,
        riskScore: Math.round(riskScore * 100),
        suspicious: riskScore > 0.7,
        riskReason: riskScore > 0.7 ? "Sandbox elevated risk scenario" : null,
        requestedAt: daysAgo(requestedDaysAgo),
        processedAt: status === "PENDING" ? null : minutesAgo(40)
      }
    });

    await prisma.financeFee.create({
      data: {
        tenantId,
        transactionId: transaction.id,
        type: type === "WITHDRAWAL" ? "WITHDRAWAL" : "DEPOSIT",
        name: `${method} sandbox fee`,
        amount: feeAmount,
        currency: "USD",
        ruleSnapshot: { source: "sandbox-seed", method }
      }
    });

    if (status === "PENDING") {
      await prisma.financeApproval.create({
        data: {
          tenantId,
          transactionId: transaction.id,
          reviewerId: manager?.id,
          step: riskScore > 0.7 ? "RISK_REVIEW" : "FINANCE_REVIEW",
          status: "PENDING",
          comment: "Sandbox approval queue item"
        }
      });
    }

    if (riskScore > 0.7) {
      await prisma.suspiciousTransactionFlag.create({
        data: {
          tenantId,
          transactionId: transaction.id,
          reviewedById: manager?.id,
          severity: riskScore > 0.9 ? "CRITICAL" : "HIGH",
          ruleCode: "SANDBOX_RISK",
          reason: "Generated high-risk funding workflow"
        }
      });
    }

    if (status === "COMPLETED" && wallet) {
      await prisma.ledgerEntry.create({
        data: {
          tenantId,
          walletId: wallet.id,
          transactionId: transaction.id,
          direction: type === "DEPOSIT" ? "CREDIT" : "DEBIT",
          entryType: type,
          amount: netAmount,
          currency: "USD",
          balanceAfter: wallet.ledgerBalance,
          reference
        }
      });
    }
  }

  const leadRows = [
    ["sandbox-lead-1", "Noah Chen", "noah.chen@nexusdemo.local", "Singapore", "NebulaFX landing page", "QUALIFIED", "APPLICATION_STARTED", 82],
    ["sandbox-lead-2", "Elena Petrova", "elena.petrova@nexusdemo.local", "Cyprus", "SquidMarkets webinar", "CONTACTED", "CONTACTED", 64],
    ["sandbox-lead-3", "Omar Hassan", "omar.hassan@nexusdemo.local", "UAE", "IB referral", "NEW", "NEW_LEAD", 51]
  ];

  for (const [id, name, email, country, source, status, onboardingStage, score] of leadRows) {
    await prisma.lead.upsert({
      where: { id },
      update: {
        tenantId,
        assignedToId: support?.id,
        name,
        email,
        country,
        source,
        status,
        onboardingStage,
        score,
        lastContactedAt: minutesAgo(70),
        nextFollowUpAt: daysAgo(-2)
      },
      create: {
        id,
        tenantId,
        assignedToId: support?.id,
        name,
        email,
        country,
        source,
        status,
        onboardingStage,
        score,
        lastContactedAt: minutesAgo(70),
        nextFollowUpAt: daysAgo(-2)
      }
    });
  }

  const activityRows = [
    ["SANDBOX_ACTIVITY_LOGIN", "user", admin?.id, { message: "Admin signed into sandbox testing environment" }],
    ["SANDBOX_ACTIVITY_BROKER_SYNC", "broker", "NebulaFX", { message: "NebulaFX accounts, balances, and trades synced" }],
    ["SANDBOX_ACTIVITY_TRADE_OPENED", "trade", "NX-T-9002", { message: "Aiko Yamamoto opened GBPUSD sell position" }],
    ["SANDBOX_NOTIFICATION_MARGIN", "notification", "SQ-T-7004", { severity: "critical", message: "Chloe Martin margin exposure breached sandbox threshold" }],
    ["SANDBOX_NOTIFICATION_WITHDRAWAL", "notification", "SANDBOX-WDR-001", { severity: "warning", message: "Aiko Yamamoto withdrawal requires approval" }]
  ];

  for (const [action, entity, entityId, metadata] of activityRows) {
    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: admin?.id,
        action,
        entity,
        entityId: String(entityId ?? "sandbox"),
        metadata,
        createdAt: minutesAgo(Math.floor(Math.random() * 90) + 5)
      }
    });
  }

  for (const platformConfig of demoPlatforms) {
    const connection = await prisma.brokerConnection.findFirst({
      where: { tenantId, adapterKey: platformConfig.adapterKey, displayName: platformConfig.displayName }
    });
    if (!connection) continue;

    await prisma.brokerSyncRun.create({
      data: {
        tenantId,
        connectionId: connection.id,
        type: "ACCOUNTS",
        status: "SUCCEEDED",
        cursorBefore: null,
        cursorAfter: "sandbox-seed",
        recordsRead: 3,
        recordsUpserted: 3,
        startedAt: minutesAgo(8),
        completedAt: minutesAgo(7)
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
