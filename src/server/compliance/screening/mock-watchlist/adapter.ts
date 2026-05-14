import { SanctionsScreeningStatus, ScreeningProviderStatus } from "@prisma/client";
import type { ScreeningProviderAdapter } from "../../core/screening-adapter";

export const mockWatchlistAdapter: ScreeningProviderAdapter = {
  key: "mock-watchlist",
  displayName: "Mock Global Watchlist",
  provider: "Internal Compliance",
  version: "2026.05",
  capabilities: ["sanctions.search", "pep.search", "adverse-media.search", "webhooks.verify", "case.refresh"],
  validateConfig({ credentials }) {
    if (!credentials.apiKey) {
      throw new Error("Mock watchlist requires apiKey credentials");
    }
  },
  async healthCheck() {
    return {
      ok: true,
      status: ScreeningProviderStatus.CONNECTED,
      latencyMs: 58,
      message: "Watchlist sandbox reachable"
    };
  },
  async screenSubject(_, subject) {
    const highRiskCountry = ["IR", "KP", "SY"].includes((subject.country ?? "").toUpperCase());
    const nameHit = /test|blocked|sanction/i.test(subject.name);
    const riskScore = nameHit ? 92 : highRiskCountry ? 72 : 18;
    const status = nameHit
      ? SanctionsScreeningStatus.CONFIRMED_MATCH
      : highRiskCountry
        ? SanctionsScreeningStatus.POSSIBLE_MATCH
        : SanctionsScreeningStatus.CLEAR;

    return {
      status,
      riskScore,
      matchCount: status === SanctionsScreeningStatus.CLEAR ? 0 : 1,
      providerReference: `WL-${subject.clientId.slice(0, 8)}-${Date.now()}`,
      payload: {
        subject,
        lists: status === SanctionsScreeningStatus.CLEAR ? [] : ["SANCTIONS", "PEP"],
        confidence: riskScore
      }
    };
  },
  verifyWebhook() {
    return true;
  }
};
