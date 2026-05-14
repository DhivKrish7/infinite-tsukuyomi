import { KycDocumentStatus, RiskLevel, SanctionsScreeningStatus } from "@prisma/client";
import type { ComplianceRiskAssessment } from "../core/domain";

type KycRiskInput = {
  clientRiskLevel?: RiskLevel;
  country?: string | null;
  documentStatuses: KycDocumentStatus[];
  screeningStatuses: SanctionsScreeningStatus[];
  openReviewCount: number;
};

const highRiskCountries = new Set(["IR", "KP", "SY"]);

export class KycRiskEngine {
  assess(input: KycRiskInput): ComplianceRiskAssessment {
    let score = 12;
    const reasons: string[] = [];

    if (input.clientRiskLevel === RiskLevel.HIGH || input.clientRiskLevel === RiskLevel.CRITICAL) {
      score += input.clientRiskLevel === RiskLevel.CRITICAL ? 35 : 22;
      reasons.push(`${input.clientRiskLevel.toLowerCase()} client risk profile`);
    }

    if (input.country && highRiskCountries.has(input.country.toUpperCase())) {
      score += 32;
      reasons.push("high-risk jurisdiction");
    }

    if (input.documentStatuses.includes(KycDocumentStatus.REJECTED)) {
      score += 24;
      reasons.push("rejected identity document");
    }

    if (input.documentStatuses.includes(KycDocumentStatus.NEEDS_RESUBMISSION)) {
      score += 12;
      reasons.push("document resubmission required");
    }

    if (input.screeningStatuses.includes(SanctionsScreeningStatus.CONFIRMED_MATCH)) {
      score += 50;
      reasons.push("confirmed sanctions match");
    } else if (input.screeningStatuses.includes(SanctionsScreeningStatus.POSSIBLE_MATCH)) {
      score += 28;
      reasons.push("possible sanctions match");
    }

    if (input.openReviewCount > 0) {
      score += 8;
      reasons.push("manual review pending");
    }

    const capped = Math.min(score, 100);
    const riskLevel = capped >= 85 ? RiskLevel.CRITICAL : capped >= 65 ? RiskLevel.HIGH : capped >= 35 ? RiskLevel.MEDIUM : RiskLevel.LOW;

    return {
      score: capped,
      riskLevel,
      reason: reasons.length ? reasons.join(", ") : "baseline KYC controls"
    };
  }
}

export const kycRiskEngine = new KycRiskEngine();
