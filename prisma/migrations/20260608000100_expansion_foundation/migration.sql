CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Brand" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT,
  "createdById" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "logoUrl" TEXT,
  "settings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Desk" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT,
  "brandId" TEXT,
  "createdById" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "settings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Desk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PermissionGroup" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT,
  "brandId" TEXT,
  "deskId" TEXT,
  "createdById" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "permissions" JSONB,
  "settings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PermissionGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminChangeLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT,
  "actorId" TEXT,
  "brandId" TEXT,
  "deskId" TEXT,
  "permissionGroupId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "before" JSONB,
  "after" JSONB,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Brand_tenantId_slug_key" ON "Brand"("tenantId", "slug");
CREATE INDEX "Brand_tenantId_status_idx" ON "Brand"("tenantId", "status");
CREATE INDEX "Brand_createdById_idx" ON "Brand"("createdById");

CREATE UNIQUE INDEX "Desk_tenantId_slug_key" ON "Desk"("tenantId", "slug");
CREATE INDEX "Desk_tenantId_status_idx" ON "Desk"("tenantId", "status");
CREATE INDEX "Desk_brandId_idx" ON "Desk"("brandId");
CREATE INDEX "Desk_createdById_idx" ON "Desk"("createdById");

CREATE UNIQUE INDEX "PermissionGroup_tenantId_slug_key" ON "PermissionGroup"("tenantId", "slug");
CREATE INDEX "PermissionGroup_tenantId_status_idx" ON "PermissionGroup"("tenantId", "status");
CREATE INDEX "PermissionGroup_brandId_idx" ON "PermissionGroup"("brandId");
CREATE INDEX "PermissionGroup_deskId_idx" ON "PermissionGroup"("deskId");
CREATE INDEX "PermissionGroup_createdById_idx" ON "PermissionGroup"("createdById");

CREATE INDEX "AdminChangeLog_tenantId_createdAt_idx" ON "AdminChangeLog"("tenantId", "createdAt");
CREATE INDEX "AdminChangeLog_actorId_createdAt_idx" ON "AdminChangeLog"("actorId", "createdAt");
CREATE INDEX "AdminChangeLog_brandId_createdAt_idx" ON "AdminChangeLog"("brandId", "createdAt");
CREATE INDEX "AdminChangeLog_deskId_createdAt_idx" ON "AdminChangeLog"("deskId", "createdAt");
CREATE INDEX "AdminChangeLog_permissionGroupId_createdAt_idx" ON "AdminChangeLog"("permissionGroupId", "createdAt");
CREATE INDEX "AdminChangeLog_entity_entityId_idx" ON "AdminChangeLog"("entity", "entityId");

ALTER TABLE "Brand"
  ADD CONSTRAINT "Brand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Brand_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Desk"
  ADD CONSTRAINT "Desk_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Desk_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Desk_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PermissionGroup"
  ADD CONSTRAINT "PermissionGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PermissionGroup_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PermissionGroup_deskId_fkey" FOREIGN KEY ("deskId") REFERENCES "Desk"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PermissionGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdminChangeLog"
  ADD CONSTRAINT "AdminChangeLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "AdminChangeLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "AdminChangeLog_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "AdminChangeLog_deskId_fkey" FOREIGN KEY ("deskId") REFERENCES "Desk"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "AdminChangeLog_permissionGroupId_fkey" FOREIGN KEY ("permissionGroupId") REFERENCES "PermissionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
