import { RiskLevel, TransactionType } from "@prisma/client";
import type { RiskAssessment } from "../core/domain";

type RiskInput = {
  type: TransactionType;
  amount: string;
  currency: string;
  clientRiskLevel?: RiskLevel;
  recentWithdrawalCount?: number;
  method?: string | null;
};

export class TransactionRiskEngine {
  assess(input: RiskInput): RiskAssessment {
    const amount = Number(input.amount);
    let score = 10;
    const reasons: string[] = [];

    if (amount >= 25000) {
      score += 35;
      reasons.push("large value movement");
    } else if (amount >= 10000) {
      score += 20;
      reasons.push("elevated value movement");
    }

    if (input.type === TransactionType.WITHDRAWAL) {
      score += 15;
      if ((input.recentWithdrawalCount ?? 0) >= 3) {
        score += 25;
        reasons.push("velocity threshold exceeded");
      }
    }

    if (input.clientRiskLevel === RiskLevel.HIGH || input.clientRiskLevel === RiskLevel.CRITICAL) {
      score += input.clientRiskLevel === RiskLevel.CRITICAL ? 35 : 20;
      reasons.push(`${input.clientRiskLevel.toLowerCase()} client risk profile`);
    }

    if (input.method?.toLowerCase().includes("crypto")) {
      score += 20;
      reasons.push("higher-risk payment method");
    }

    const severity = score >= 85 ? "CRITICAL" : score >= 65 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";

    return {
      score: Math.min(score, 100),
      suspicious: score >= 65,
      severity,
      ruleCode: score >= 65 ? "TXN_RISK_THRESHOLD" : "TXN_BASELINE",
      reason: reasons.length ? reasons.join(", ") : "baseline transaction controls"
    };
  }
}

export const transactionRiskEngine = new TransactionRiskEngine();
