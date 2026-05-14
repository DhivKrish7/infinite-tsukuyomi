import {
  ComplianceReviewStatus,
  KycDocumentStatus,
  KycStatus,
  Prisma,
  RiskLevel,
  SanctionsScreeningStatus
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { screeningProviderRegistry } from "../core/registry";
import { kycRiskEngine } from "../risk/kyc-risk-engine";
import { registerScreeningProviders } from "../screening/register-screening-providers";

type ListCasesInput = {
  tenantId: string;
  q?: string;
  status?: KycStatus;
  riskLevel?: RiskLevel;
  page: number;
  pageSize: number;
};

type CreateCaseInput = {
  tenantId: string;
  actorId: string;
  clientId: string;
  workflowStage: string;
  notes?: string;
};

type UploadDocumentInput = {
  tenantId: string;
  actorId: string;
  kycCaseId: string;
  type: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  storageKey: string;
  checksum?: string;
  expiresAt?: string;
};

type ReviewCaseInput = {
  tenantId: string;
  actorId: string;
  kycCaseId: string;
  status: Extract<ComplianceReviewStatus, "APPROVED" | "REJECTED" | "ESCALATED" | "INFORMATION_REQUESTED">;
  summary?: string;
  decisionCode?: string;
  checklist?: Record<string, unknown>;
};

type CreateNoteInput = {
  tenantId: string;
  actorId: string;
  kycCaseId: string;
  body: string;
  visibility: "INTERNAL" | "AUDIT" | "ESCALATION";
  pinned: boolean;
};

const caseInclude = {
  client: { select: { id: true, name: true, email: true, country: true, kycStatus: true, riskLevel: true } },
  assignedReviewer: { select: { id: true, name: true, email: true } },
  documents: { orderBy: { uploadedAt: "desc" } },
  screenings: { include: { providerConnection: true }, orderBy: { createdAt: "desc" } },
  reviews: { include: { reviewer: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
  complianceNotes: { include: { author: { select: { id: true, name: true, email: true } } }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] },
  auditEvents: { include: { actor: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 20 }
} satisfies Prisma.KycCaseInclude;

export class ComplianceManagementService {
  constructor() {
    registerScreeningProviders();
  }

  async getOverview(tenantId: string) {
    const [
      pendingReviews,
      highRiskCases,
      resubmissions,
      sanctionsMatches,
      cases,
      documents,
      screenings,
      notes,
      auditEvents,
      providers
    ] = await prisma.$transaction([
      prisma.kycCase.count({ where: { tenantId, status: { in: [KycStatus.PENDING, KycStatus.IN_REVIEW] } } }),
      prisma.kycCase.count({ where: { tenantId, riskLevel: { in: [RiskLevel.HIGH, RiskLevel.CRITICAL] } } }),
      prisma.kycDocument.count({ where: { tenantId, status: KycDocumentStatus.NEEDS_RESUBMISSION } }),
      prisma.sanctionsScreening.count({
        where: { tenantId, status: { in: [SanctionsScreeningStatus.POSSIBLE_MATCH, SanctionsScreeningStatus.CONFIRMED_MATCH] } }
      }),
      prisma.kycCase.findMany({ where: { tenantId }, include: caseInclude, orderBy: { updatedAt: "desc" }, take: 12 }),
      prisma.kycDocument.findMany({
        where: { tenantId },
        include: { client: { select: { id: true, name: true, email: true } }, reviewedBy: { select: { id: true, name: true } } },
        orderBy: { uploadedAt: "desc" },
        take: 12
      }),
      prisma.sanctionsScreening.findMany({
        where: { tenantId },
        include: {
          client: { select: { id: true, name: true, email: true, country: true } },
          providerConnection: true
        },
        orderBy: { createdAt: "desc" },
        take: 12
      }),
      prisma.complianceNote.findMany({
        where: { tenantId },
        include: { client: { select: { id: true, name: true, email: true } }, author: { select: { id: true, name: true } } },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 8
      }),
      prisma.complianceAuditEvent.findMany({
        where: { tenantId },
        include: { actor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 16
      }),
      prisma.screeningProviderConnection.findMany({ where: { tenantId }, orderBy: { displayName: "asc" } })
    ]);

    return {
      metrics: { pendingReviews, highRiskCases, resubmissions, sanctionsMatches },
      cases,
      documents,
      screenings,
      notes,
      auditEvents,
      providers,
      providerAdapters: screeningProviderRegistry.list()
    };
  }

  async listCases(input: ListCasesInput) {
    const where: Prisma.KycCaseWhereInput = {
      tenantId: input.tenantId,
      ...(input.status ? { status: input.status } : {}),
      ...(input.riskLevel ? { riskLevel: input.riskLevel } : {}),
      ...(input.q
        ? {
            OR: [
              { client: { name: { contains: input.q, mode: "insensitive" } } },
              { client: { email: { contains: input.q, mode: "insensitive" } } },
              { workflowStage: { contains: input.q, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await prisma.$transaction([
      prisma.kycCase.findMany({
        where,
        include: caseInclude,
        orderBy: { updatedAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize
      }),
      prisma.kycCase.count({ where })
    ]);

    return {
      items,
      meta: {
        total,
        page: input.page,
        pageSize: input.pageSize,
        pageCount: Math.max(Math.ceil(total / input.pageSize), 1)
      }
    };
  }

  async createCase(input: CreateCaseInput) {
    const client = await prisma.client.findFirstOrThrow({
      where: { id: input.clientId, tenantId: input.tenantId }
    });

    const result = await prisma.kycCase.create({
      data: {
        tenantId: input.tenantId,
        clientId: input.clientId,
        status: KycStatus.PENDING,
        workflowStage: input.workflowStage,
        notes: input.notes,
        submittedAt: new Date(),
        riskLevel: client.riskLevel,
        reviews: {
          create: {
            tenantId: input.tenantId,
            status: ComplianceReviewStatus.PENDING
          }
        },
        auditEvents: {
          create: {
            tenantId: input.tenantId,
            actorId: input.actorId,
            action: "KYC_CASE_CREATED",
            entity: "kyc_case",
            entityId: input.clientId,
            metadata: { clientId: input.clientId }
          }
        }
      },
      include: caseInclude
    });

    await prisma.client.update({
      where: { id: input.clientId },
      data: { kycStatus: KycStatus.PENDING, onboardingStage: "KYC_REVIEW" }
    });

    return result;
  }

  async uploadDocument(input: UploadDocumentInput) {
    const kycCase = await prisma.kycCase.findFirstOrThrow({
      where: { id: input.kycCaseId, tenantId: input.tenantId }
    });

    return prisma.$transaction(async (tx) => {
      const document = await tx.kycDocument.create({
        data: {
          tenantId: input.tenantId,
          clientId: kycCase.clientId,
          kycCaseId: kycCase.id,
          type: input.type as never,
          status: KycDocumentStatus.UPLOADED,
          fileName: input.fileName,
          mimeType: input.mimeType,
          byteSize: input.byteSize,
          storageKey: input.storageKey,
          checksum: input.checksum,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined
        }
      });

      await tx.complianceAuditEvent.create({
        data: {
          tenantId: input.tenantId,
          kycCaseId: kycCase.id,
          actorId: input.actorId,
          action: "KYC_DOCUMENT_UPLOADED",
          entity: "kyc_document",
          entityId: document.id,
          metadata: { type: document.type, fileName: document.fileName, byteSize: document.byteSize }
        }
      });

      await tx.kycCase.update({
        where: { id: kycCase.id },
        data: { status: KycStatus.IN_REVIEW, workflowStage: "DOCUMENT_REVIEW" }
      });

      return document;
    });
  }

  async reviewCase(input: ReviewCaseInput) {
    const kycCase = await prisma.kycCase.findFirstOrThrow({
      where: { id: input.kycCaseId, tenantId: input.tenantId },
      include: { client: true, documents: true, screenings: true, reviews: true }
    });

    const assessment = kycRiskEngine.assess({
      clientRiskLevel: kycCase.client.riskLevel,
      country: kycCase.client.country,
      documentStatuses: kycCase.documents.map((document) => document.status),
      screeningStatuses: kycCase.screenings.map((screening) => screening.status),
      openReviewCount: kycCase.reviews.filter((review) => review.status === ComplianceReviewStatus.PENDING).length
    });
    const caseStatus =
      input.status === ComplianceReviewStatus.APPROVED
        ? KycStatus.VERIFIED
        : input.status === ComplianceReviewStatus.REJECTED
          ? KycStatus.FAILED
          : KycStatus.FLAGGED;

    return prisma.$transaction(async (tx) => {
      await tx.complianceReview.updateMany({
        where: { kycCaseId: kycCase.id, status: ComplianceReviewStatus.PENDING },
        data: {
          reviewerId: input.actorId,
          status: input.status,
          decisionCode: input.decisionCode,
          summary: input.summary,
          checklist: input.checklist as Prisma.InputJsonValue,
          decidedAt: new Date()
        }
      });

      const updated = await tx.kycCase.update({
        where: { id: kycCase.id },
        data: {
          status: caseStatus,
          riskScore: assessment.score,
          riskLevel: assessment.riskLevel,
          riskReason: assessment.reason,
          assignedReviewerId: input.actorId,
          workflowStage: caseStatus === KycStatus.VERIFIED ? "APPROVED" : "ESCALATED",
          decidedAt: new Date()
        },
        include: caseInclude
      });

      await tx.client.update({
        where: { id: kycCase.clientId },
        data: {
          kycStatus: caseStatus,
          riskLevel: assessment.riskLevel
        }
      });

      await tx.complianceAuditEvent.create({
        data: {
          tenantId: input.tenantId,
          kycCaseId: kycCase.id,
          actorId: input.actorId,
          action: `KYC_CASE_${input.status}`,
          entity: "kyc_case",
          entityId: kycCase.id,
          metadata: { riskScore: assessment.score, riskLevel: assessment.riskLevel, reason: assessment.reason }
        }
      });

      return updated;
    });
  }

  async createNote(input: CreateNoteInput) {
    const kycCase = await prisma.kycCase.findFirstOrThrow({
      where: { id: input.kycCaseId, tenantId: input.tenantId }
    });

    return prisma.$transaction(async (tx) => {
      const note = await tx.complianceNote.create({
        data: {
          tenantId: input.tenantId,
          clientId: kycCase.clientId,
          kycCaseId: kycCase.id,
          authorId: input.actorId,
          body: input.body,
          visibility: input.visibility,
          pinned: input.pinned
        }
      });

      await tx.complianceAuditEvent.create({
        data: {
          tenantId: input.tenantId,
          kycCaseId: kycCase.id,
          actorId: input.actorId,
          action: "COMPLIANCE_NOTE_CREATED",
          entity: "compliance_note",
          entityId: note.id,
          metadata: { visibility: note.visibility, pinned: note.pinned }
        }
      });

      return note;
    });
  }

  async runScreening(input: { tenantId: string; actorId: string; kycCaseId: string; providerConnectionId?: string }) {
    const kycCase = await prisma.kycCase.findFirstOrThrow({
      where: { id: input.kycCaseId, tenantId: input.tenantId },
      include: { client: true }
    });
    const providerConnection = input.providerConnectionId
      ? await prisma.screeningProviderConnection.findFirstOrThrow({
          where: { id: input.providerConnectionId, tenantId: input.tenantId }
        })
      : null;

    const adapter = screeningProviderRegistry.get(providerConnection?.key ?? "mock-watchlist");
    const result = await adapter.screenSubject(
      {
        tenantId: input.tenantId,
        connectionId: providerConnection?.id ?? "runtime",
        credentials: (providerConnection?.credentials as Record<string, unknown> | null) ?? { apiKey: "runtime" },
        settings: (providerConnection?.settings as Record<string, unknown> | null) ?? {}
      },
      {
        clientId: kycCase.clientId,
        name: kycCase.client.name,
        email: kycCase.client.email,
        country: kycCase.client.country
      }
    );

    return prisma.$transaction(async (tx) => {
      const screening = await tx.sanctionsScreening.create({
        data: {
          tenantId: input.tenantId,
          clientId: kycCase.clientId,
          kycCaseId: kycCase.id,
          providerConnectionId: providerConnection?.id,
          status: result.status,
          riskScore: result.riskScore,
          matchCount: result.matchCount,
          providerReference: result.providerReference,
          searchProfile: {
            name: kycCase.client.name,
            email: kycCase.client.email,
            country: kycCase.client.country
          },
          resultPayload: result.payload as Prisma.InputJsonValue,
          screenedAt: new Date()
        }
      });

      await tx.kycCase.update({
        where: { id: kycCase.id },
        data: {
          status: result.status === SanctionsScreeningStatus.CLEAR ? KycStatus.IN_REVIEW : KycStatus.FLAGGED,
          workflowStage: result.status === SanctionsScreeningStatus.CLEAR ? "MANUAL_REVIEW" : "SANCTIONS_ESCALATION"
        }
      });

      await tx.complianceAuditEvent.create({
        data: {
          tenantId: input.tenantId,
          kycCaseId: kycCase.id,
          actorId: input.actorId,
          action: "SANCTIONS_SCREENING_RUN",
          entity: "sanctions_screening",
          entityId: screening.id,
          metadata: { status: result.status, riskScore: result.riskScore, matchCount: result.matchCount }
        }
      });

      return screening;
    });
  }

  async listScreeningProviders(tenantId: string) {
    const connections = await prisma.screeningProviderConnection.findMany({
      where: { tenantId },
      orderBy: { displayName: "asc" }
    });

    return {
      adapters: screeningProviderRegistry.list(),
      connections
    };
  }
}

export const complianceManagementService = new ComplianceManagementService();
