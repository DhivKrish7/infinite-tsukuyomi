CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'DISABLED', 'REVOKED');
CREATE TYPE "IpRestrictionMode" AS ENUM ('ALLOW', 'DENY');
CREATE TYPE "CrmExtensionTarget" AS ENUM ('CLIENT', 'LEAD', 'TASK', 'GLOBAL');
CREATE TYPE "CrmCustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'URL');

CREATE TABLE "ApiKey" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdById" TEXT,
  "name" TEXT NOT NULL,
  "keyPrefix" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "scopes" JSONB,
  "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
  "lastUsedAt" TIMESTAMP(3),
  "lastUsedIp" TEXT,
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IpRestriction" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT,
  "createdById" TEXT,
  "label" TEXT NOT NULL,
  "cidr" TEXT NOT NULL,
  "mode" "IpRestrictionMode" NOT NULL DEFAULT 'ALLOW',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "IpRestriction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmExtensionModule" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isEnabled" BOOLEAN NOT NULL DEFAULT false,
  "settings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrmExtensionModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmSavedFilter" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "moduleKey" TEXT NOT NULL,
  "target" "CrmExtensionTarget" NOT NULL,
  "name" TEXT NOT NULL,
  "criteria" JSONB NOT NULL,
  "isShared" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrmSavedFilter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmSavedView" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "filterId" TEXT,
  "moduleKey" TEXT NOT NULL,
  "target" "CrmExtensionTarget" NOT NULL,
  "name" TEXT NOT NULL,
  "columns" JSONB,
  "sort" JSONB,
  "layout" JSONB,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isShared" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrmSavedView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmColumnPreference" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "moduleKey" TEXT NOT NULL,
  "target" "CrmExtensionTarget" NOT NULL,
  "columnKey" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "width" INTEGER,
  "pinned" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrmColumnPreference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmCustomField" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "moduleKey" TEXT NOT NULL,
  "target" "CrmExtensionTarget" NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "type" "CrmCustomFieldType" NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "options" JSONB,
  "defaultValue" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrmCustomField_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmCustomFieldValue" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "customFieldId" TEXT NOT NULL,
  "target" "CrmExtensionTarget" NOT NULL,
  "entityId" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrmCustomFieldValue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
CREATE INDEX "ApiKey_tenantId_status_idx" ON "ApiKey"("tenantId", "status");
CREATE INDEX "ApiKey_userId_status_idx" ON "ApiKey"("userId", "status");
CREATE INDEX "ApiKey_createdById_idx" ON "ApiKey"("createdById");

CREATE UNIQUE INDEX "IpRestriction_tenantId_cidr_userId_mode_key" ON "IpRestriction"("tenantId", "cidr", "userId", "mode");
CREATE INDEX "IpRestriction_tenantId_status_idx" ON "IpRestriction"("tenantId", "status");
CREATE INDEX "IpRestriction_userId_idx" ON "IpRestriction"("userId");
CREATE INDEX "IpRestriction_createdById_idx" ON "IpRestriction"("createdById");

CREATE UNIQUE INDEX "CrmExtensionModule_tenantId_key_key" ON "CrmExtensionModule"("tenantId", "key");
CREATE INDEX "CrmExtensionModule_tenantId_isEnabled_idx" ON "CrmExtensionModule"("tenantId", "isEnabled");

CREATE UNIQUE INDEX "CrmSavedFilter_tenantId_ownerId_target_name_key" ON "CrmSavedFilter"("tenantId", "ownerId", "target", "name");
CREATE INDEX "CrmSavedFilter_tenantId_target_isShared_idx" ON "CrmSavedFilter"("tenantId", "target", "isShared");
CREATE INDEX "CrmSavedFilter_ownerId_idx" ON "CrmSavedFilter"("ownerId");

CREATE UNIQUE INDEX "CrmSavedView_tenantId_ownerId_target_name_key" ON "CrmSavedView"("tenantId", "ownerId", "target", "name");
CREATE INDEX "CrmSavedView_tenantId_target_isShared_idx" ON "CrmSavedView"("tenantId", "target", "isShared");
CREATE INDEX "CrmSavedView_ownerId_idx" ON "CrmSavedView"("ownerId");
CREATE INDEX "CrmSavedView_filterId_idx" ON "CrmSavedView"("filterId");

CREATE UNIQUE INDEX "CrmColumnPreference_tenantId_ownerId_target_columnKey_key" ON "CrmColumnPreference"("tenantId", "ownerId", "target", "columnKey");
CREATE INDEX "CrmColumnPreference_tenantId_target_idx" ON "CrmColumnPreference"("tenantId", "target");
CREATE INDEX "CrmColumnPreference_ownerId_idx" ON "CrmColumnPreference"("ownerId");

CREATE UNIQUE INDEX "CrmCustomField_tenantId_target_key_key" ON "CrmCustomField"("tenantId", "target", "key");
CREATE INDEX "CrmCustomField_tenantId_target_active_idx" ON "CrmCustomField"("tenantId", "target", "active");

CREATE UNIQUE INDEX "CrmCustomFieldValue_customFieldId_entityId_key" ON "CrmCustomFieldValue"("customFieldId", "entityId");
CREATE INDEX "CrmCustomFieldValue_tenantId_target_entityId_idx" ON "CrmCustomFieldValue"("tenantId", "target", "entityId");

ALTER TABLE "ApiKey"
  ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ApiKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "IpRestriction"
  ADD CONSTRAINT "IpRestriction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "IpRestriction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "IpRestriction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmExtensionModule"
  ADD CONSTRAINT "CrmExtensionModule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmSavedFilter"
  ADD CONSTRAINT "CrmSavedFilter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CrmSavedFilter_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmSavedView"
  ADD CONSTRAINT "CrmSavedView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CrmSavedView_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CrmSavedView_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "CrmSavedFilter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmColumnPreference"
  ADD CONSTRAINT "CrmColumnPreference_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CrmColumnPreference_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmCustomField"
  ADD CONSTRAINT "CrmCustomField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmCustomFieldValue"
  ADD CONSTRAINT "CrmCustomFieldValue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CrmCustomFieldValue_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "CrmCustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
