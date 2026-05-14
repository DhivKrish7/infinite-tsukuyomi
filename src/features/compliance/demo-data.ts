import type { ComplianceOverview } from "./types";

const now = Date.now();

export const demoComplianceOverview: ComplianceOverview = {
  metrics: {
    pendingReviews: 11,
    highRiskCases: 4,
    resubmissions: 6,
    sanctionsMatches: 2
  },
  cases: [
    {
      id: "kyc-1",
      status: "IN_REVIEW",
      riskLevel: "HIGH",
      riskScore: 78,
      riskReason: "possible sanctions match, document resubmission required",
      workflowStage: "SANCTIONS_ESCALATION",
      submittedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 35 * 60 * 1000).toISOString(),
      client: { id: "client-1", name: "Maya Chen", email: "maya@example.com", country: "SG", riskLevel: "HIGH" },
      assignedReviewer: { id: "user-1", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      documents: [],
      reviews: [{ id: "review-1", status: "PENDING", createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString() }],
      screenings: [],
      complianceNotes: [],
      auditEvents: []
    },
    {
      id: "kyc-2",
      status: "VERIFIED",
      riskLevel: "LOW",
      riskScore: 18,
      workflowStage: "APPROVED",
      submittedAt: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
      decidedAt: new Date(now - 36 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 36 * 60 * 60 * 1000).toISOString(),
      client: { id: "client-2", name: "Ari Sterling", email: "ari@example.com", country: "GB", riskLevel: "LOW" },
      documents: [],
      reviews: [{ id: "review-2", status: "APPROVED", createdAt: new Date(now - 40 * 60 * 60 * 1000).toISOString() }],
      screenings: [],
      complianceNotes: [],
      auditEvents: []
    }
  ],
  documents: [
    {
      id: "doc-1",
      type: "PASSPORT",
      status: "ACCEPTED",
      fileName: "passport-redacted.pdf",
      mimeType: "application/pdf",
      byteSize: 822000,
      storageKey: "kyc/client-2/passport-redacted.pdf",
      uploadedAt: new Date(now - 46 * 60 * 60 * 1000).toISOString(),
      reviewedAt: new Date(now - 38 * 60 * 60 * 1000).toISOString(),
      client: { id: "client-2", name: "Ari Sterling", email: "ari@example.com" },
      reviewedBy: { id: "user-1", name: "Nexus Admin" }
    },
    {
      id: "doc-2",
      type: "PROOF_OF_ADDRESS",
      status: "NEEDS_RESUBMISSION",
      fileName: "utility-bill.jpg",
      mimeType: "image/jpeg",
      byteSize: 1140000,
      storageKey: "kyc/client-1/utility-bill.jpg",
      rejectionReason: "Address does not match declared country",
      uploadedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      client: { id: "client-1", name: "Maya Chen", email: "maya@example.com" }
    }
  ],
  screenings: [
    {
      id: "screen-1",
      status: "POSSIBLE_MATCH",
      riskScore: 72,
      matchCount: 1,
      providerReference: "WL-client-1",
      screenedAt: new Date(now - 45 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
      client: { id: "client-1", name: "Maya Chen", email: "maya@example.com", country: "SG" },
      providerConnection: {
        id: "provider-1",
        key: "mock-watchlist",
        displayName: "Mock Global Watchlist",
        provider: "Internal Compliance",
        status: "CONNECTED"
      }
    }
  ],
  notes: [
    {
      id: "note-1",
      visibility: "ESCALATION",
      body: "Escalated for secondary sanctions review before account activation.",
      pinned: true,
      createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
      client: { id: "client-1", name: "Maya Chen", email: "maya@example.com" },
      author: { id: "user-1", name: "Nexus Admin" }
    }
  ],
  auditEvents: [
    {
      id: "audit-1",
      action: "SANCTIONS_SCREENING_RUN",
      entity: "sanctions_screening",
      entityId: "screen-1",
      createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
      actor: { id: "user-1", name: "Nexus Admin", email: "admin@nexuscrm.local" },
      metadata: { status: "POSSIBLE_MATCH", riskScore: 72 }
    }
  ],
  providers: [
    {
      id: "provider-1",
      key: "mock-watchlist",
      displayName: "Mock Global Watchlist",
      provider: "Internal Compliance",
      status: "CONNECTED",
      lastHealthCheckAt: new Date(now - 10 * 60 * 1000).toISOString()
    }
  ],
  providerAdapters: [
    {
      key: "mock-watchlist",
      displayName: "Mock Global Watchlist",
      provider: "Internal Compliance",
      version: "2026.05",
      capabilities: ["sanctions.search", "pep.search", "adverse-media.search", "webhooks.verify", "case.refresh"]
    }
  ]
};
