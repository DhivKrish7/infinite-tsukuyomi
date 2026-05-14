export type ComplianceMetricSet = {
  pendingReviews: number;
  highRiskCases: number;
  resubmissions: number;
  sanctionsMatches: number;
};

export type ComplianceClientRef = {
  id: string;
  name: string;
  email: string;
  country?: string | null;
  kycStatus?: string;
  riskLevel?: string;
};

export type KycDocument = {
  id: string;
  type: string;
  status: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  storageKey: string;
  rejectionReason?: string | null;
  uploadedAt: string;
  reviewedAt?: string | null;
  expiresAt?: string | null;
  client?: ComplianceClientRef;
  reviewedBy?: { id: string; name: string } | null;
};

export type ComplianceReview = {
  id: string;
  status: string;
  decisionCode?: string | null;
  summary?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  reviewer?: { id: string; name: string; email: string } | null;
};

export type SanctionsScreening = {
  id: string;
  status: string;
  riskScore: number;
  matchCount: number;
  providerReference?: string | null;
  screenedAt?: string | null;
  createdAt: string;
  client?: ComplianceClientRef;
  providerConnection?: ScreeningProviderConnection | null;
};

export type ComplianceNote = {
  id: string;
  visibility: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  client?: ComplianceClientRef;
  author?: { id: string; name: string } | null;
};

export type ComplianceAuditEvent = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string } | null;
};

export type KycCase = {
  id: string;
  status: string;
  riskLevel: string;
  riskScore: number;
  riskReason?: string | null;
  workflowStage: string;
  submittedAt?: string | null;
  decidedAt?: string | null;
  updatedAt: string;
  client: ComplianceClientRef;
  assignedReviewer?: { id: string; name: string; email: string } | null;
  documents?: KycDocument[];
  reviews?: ComplianceReview[];
  screenings?: SanctionsScreening[];
  complianceNotes?: ComplianceNote[];
  auditEvents?: ComplianceAuditEvent[];
};

export type ScreeningProviderConnection = {
  id: string;
  key: string;
  displayName: string;
  provider: string;
  status: string;
  lastHealthCheckAt?: string | null;
};

export type ScreeningProviderAdapter = {
  key: string;
  displayName: string;
  provider: string;
  version: string;
  capabilities: string[];
};

export type ComplianceOverview = {
  metrics: ComplianceMetricSet;
  cases: KycCase[];
  documents: KycDocument[];
  screenings: SanctionsScreening[];
  notes: ComplianceNote[];
  auditEvents: ComplianceAuditEvent[];
  providers: ScreeningProviderConnection[];
  providerAdapters: ScreeningProviderAdapter[];
};
