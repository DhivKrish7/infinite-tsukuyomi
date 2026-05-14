import type { RiskLevel, SanctionsScreeningStatus, ScreeningProviderStatus } from "@prisma/client";

export type ScreeningCapability =
  | "sanctions.search"
  | "pep.search"
  | "adverse-media.search"
  | "webhooks.verify"
  | "case.refresh";

export type ScreeningProviderContext = {
  tenantId: string;
  connectionId: string;
  credentials: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export type ScreeningHealth = {
  ok: boolean;
  status: ScreeningProviderStatus;
  latencyMs?: number;
  message?: string;
};

export type ScreeningSubject = {
  clientId: string;
  name: string;
  email?: string | null;
  country?: string | null;
  dateOfBirth?: string | null;
};

export type ScreeningResult = {
  status: SanctionsScreeningStatus;
  riskScore: number;
  matchCount: number;
  providerReference: string;
  payload: Record<string, unknown>;
};

export type ComplianceRiskAssessment = {
  score: number;
  riskLevel: RiskLevel;
  reason: string;
};
