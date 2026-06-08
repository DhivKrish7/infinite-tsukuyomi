CREATE TYPE "ReportType" AS ENUM ('CUSTOMER', 'TRADE', 'TRANSACTION');
CREATE TYPE "ReportHistoryStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "ReportExportFormat" AS ENUM ('CSV', 'XLSX', 'JSON', 'PDF');

CREATE TABLE "ReportDefinition" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "createdById" TEXT,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "ReportType" NOT NULL,
  "description" TEXT,
  "columns" JSONB NOT NULL,
  "filters" JSONB,
  "exportConfig" JSONB,
  "isSystem" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReportDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportHistory" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "definitionId" TEXT,
  "requestedById" TEXT,
  "type" "ReportType" NOT NULL,
  "status" "ReportHistoryStatus" NOT NULL DEFAULT 'COMPLETED',
  "exportFormat" "ReportExportFormat",
  "parameters" JSONB,
  "rowCount" INTEGER NOT NULL DEFAULT 0,
  "resultSnapshot" JSONB,
  "exportLocation" TEXT,
  "error" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReportHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReportDefinition_tenantId_key_key" ON "ReportDefinition"("tenantId", "key");
CREATE INDEX "ReportDefinition_tenantId_type_isActive_idx" ON "ReportDefinition"("tenantId", "type", "isActive");
CREATE INDEX "ReportDefinition_createdById_idx" ON "ReportDefinition"("createdById");

CREATE INDEX "ReportHistory_tenantId_type_createdAt_idx" ON "ReportHistory"("tenantId", "type", "createdAt");
CREATE INDEX "ReportHistory_definitionId_idx" ON "ReportHistory"("definitionId");
CREATE INDEX "ReportHistory_requestedById_idx" ON "ReportHistory"("requestedById");

ALTER TABLE "ReportDefinition"
  ADD CONSTRAINT "ReportDefinition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ReportDefinition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReportHistory"
  ADD CONSTRAINT "ReportHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ReportHistory_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "ReportDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "ReportHistory_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
