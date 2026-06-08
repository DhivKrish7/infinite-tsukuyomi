CREATE TYPE "DynamicFormKind" AS ENUM ('SIGNUP', 'QUESTIONNAIRE');
CREATE TYPE "DynamicFormStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "DynamicFormFieldType" AS ENUM ('TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'CONSENT', 'HIDDEN');
CREATE TYPE "MarketingCampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "MarketingChannel" AS ENUM ('SEARCH', 'SOCIAL', 'EMAIL', 'AFFILIATE', 'REFERRAL', 'DISPLAY', 'EVENT', 'ORGANIC');
CREATE TYPE "MarketingAttributionType" AS ENUM ('FIRST_TOUCH', 'LAST_TOUCH', 'ASSISTED', 'CONVERSION');
CREATE TYPE "MarketingFunnelStage" AS ENUM ('IMPRESSION', 'VISIT', 'LEAD', 'APPLICATION', 'KYC_SUBMITTED', 'FUNDED', 'ACTIVE_TRADER');

ALTER TABLE "Client"
ADD COLUMN "attributionCampaignId" TEXT,
ADD COLUMN "initialAttributionId" TEXT;

ALTER TABLE "Lead"
ADD COLUMN "attributionCampaignId" TEXT,
ADD COLUMN "initialAttributionId" TEXT;

CREATE TABLE "DynamicForm" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "kind" "DynamicFormKind" NOT NULL,
  "status" "DynamicFormStatus" NOT NULL DEFAULT 'DRAFT',
  "currentVersionId" TEXT,
  "settings" JSONB,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DynamicForm_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DynamicFormVersion" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "definition" JSONB NOT NULL,
  "notes" TEXT,
  "createdById" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DynamicFormVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingCampaign" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "MarketingCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "channel" "MarketingChannel" NOT NULL,
  "objective" TEXT,
  "budget" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "spend" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "attributionModel" TEXT NOT NULL DEFAULT 'last_touch',
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "ownerId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingAttribution" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "campaignId" TEXT,
  "leadId" TEXT,
  "clientId" TEXT,
  "type" "MarketingAttributionType" NOT NULL,
  "source" TEXT NOT NULL,
  "medium" TEXT,
  "touchpoint" TEXT NOT NULL,
  "landingPage" TEXT,
  "referrer" TEXT,
  "conversionValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MarketingAttribution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingFunnelEvent" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "campaignId" TEXT,
  "stage" "MarketingFunnelStage" NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "value" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MarketingFunnelEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DynamicForm_currentVersionId_key" ON "DynamicForm"("currentVersionId");
CREATE UNIQUE INDEX "DynamicForm_tenantId_key_key" ON "DynamicForm"("tenantId", "key");
CREATE INDEX "DynamicForm_tenantId_kind_status_idx" ON "DynamicForm"("tenantId", "kind", "status");
CREATE UNIQUE INDEX "DynamicFormVersion_formId_version_key" ON "DynamicFormVersion"("formId", "version");
CREATE INDEX "DynamicFormVersion_tenantId_formId_version_idx" ON "DynamicFormVersion"("tenantId", "formId", "version");
CREATE UNIQUE INDEX "MarketingCampaign_tenantId_key_key" ON "MarketingCampaign"("tenantId", "key");
CREATE INDEX "MarketingCampaign_tenantId_status_channel_idx" ON "MarketingCampaign"("tenantId", "status", "channel");
CREATE INDEX "MarketingAttribution_tenantId_occurredAt_idx" ON "MarketingAttribution"("tenantId", "occurredAt");
CREATE INDEX "MarketingAttribution_campaignId_type_idx" ON "MarketingAttribution"("campaignId", "type");
CREATE INDEX "MarketingAttribution_leadId_idx" ON "MarketingAttribution"("leadId");
CREATE INDEX "MarketingAttribution_clientId_idx" ON "MarketingAttribution"("clientId");
CREATE INDEX "MarketingFunnelEvent_tenantId_stage_periodStart_idx" ON "MarketingFunnelEvent"("tenantId", "stage", "periodStart");
CREATE INDEX "MarketingFunnelEvent_campaignId_periodStart_idx" ON "MarketingFunnelEvent"("campaignId", "periodStart");
CREATE INDEX "Client_attributionCampaignId_idx" ON "Client"("attributionCampaignId");
CREATE INDEX "Client_initialAttributionId_idx" ON "Client"("initialAttributionId");
CREATE INDEX "Lead_attributionCampaignId_idx" ON "Lead"("attributionCampaignId");
CREATE INDEX "Lead_initialAttributionId_idx" ON "Lead"("initialAttributionId");

ALTER TABLE "DynamicForm" ADD CONSTRAINT "DynamicForm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DynamicForm" ADD CONSTRAINT "DynamicForm_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "DynamicFormVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DynamicFormVersion" ADD CONSTRAINT "DynamicFormVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DynamicFormVersion" ADD CONSTRAINT "DynamicFormVersion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "DynamicForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingAttribution" ADD CONSTRAINT "MarketingAttribution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingAttribution" ADD CONSTRAINT "MarketingAttribution_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketingAttribution" ADD CONSTRAINT "MarketingAttribution_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketingAttribution" ADD CONSTRAINT "MarketingAttribution_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketingFunnelEvent" ADD CONSTRAINT "MarketingFunnelEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingFunnelEvent" ADD CONSTRAINT "MarketingFunnelEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_attributionCampaignId_fkey" FOREIGN KEY ("attributionCampaignId") REFERENCES "MarketingCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_initialAttributionId_fkey" FOREIGN KEY ("initialAttributionId") REFERENCES "MarketingAttribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_attributionCampaignId_fkey" FOREIGN KEY ("attributionCampaignId") REFERENCES "MarketingCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_initialAttributionId_fkey" FOREIGN KEY ("initialAttributionId") REFERENCES "MarketingAttribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
