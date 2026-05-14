import { z } from "zod";

export const complianceCaseListSchema = z.object({
  q: z.string().optional(),
  status: z.enum(["NOT_STARTED", "PENDING", "IN_REVIEW", "VERIFIED", "FAILED", "FLAGGED"]).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25)
});

export const createKycCaseSchema = z.object({
  clientId: z.string().uuid(),
  workflowStage: z.string().max(80).default("DOCUMENT_COLLECTION"),
  notes: z.string().max(1000).optional()
});

export const uploadKycDocumentSchema = z.object({
  type: z.enum([
    "PASSPORT",
    "NATIONAL_ID",
    "DRIVER_LICENSE",
    "PROOF_OF_ADDRESS",
    "BANK_STATEMENT",
    "SOURCE_OF_FUNDS",
    "SELFIE",
    "OTHER"
  ]),
  fileName: z.string().min(1).max(240),
  mimeType: z.string().min(3).max(120),
  byteSize: z.coerce.number().int().min(1).max(25_000_000),
  storageKey: z.string().min(3).max(500),
  checksum: z.string().max(160).optional(),
  expiresAt: z.string().datetime().optional()
});

export const reviewKycCaseSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ESCALATED", "INFORMATION_REQUESTED"]),
  summary: z.string().max(1000).optional(),
  decisionCode: z.string().max(80).optional(),
  checklist: z.record(z.unknown()).optional()
});

export const createComplianceNoteSchema = z.object({
  body: z.string().min(3).max(2000),
  visibility: z.enum(["INTERNAL", "AUDIT", "ESCALATION"]).default("INTERNAL"),
  pinned: z.boolean().default(false)
});
