export type MarketingCampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type MarketingChannel = "SEARCH" | "SOCIAL" | "EMAIL" | "AFFILIATE" | "REFERRAL" | "DISPLAY" | "EVENT" | "ORGANIC";
export type MarketingAttributionType = "FIRST_TOUCH" | "LAST_TOUCH" | "ASSISTED" | "CONVERSION";
export type MarketingFunnelStage =
  | "IMPRESSION"
  | "VISIT"
  | "LEAD"
  | "APPLICATION"
  | "KYC_SUBMITTED"
  | "FUNDED"
  | "ACTIVE_TRADER";

export type MarketingMetrics = {
  activeCampaigns: number;
  spend30d: string | number;
  attributedRevenue30d: string | number;
  conversionRate: number;
  cpa: string | number;
};

export type MarketingCampaign = {
  id: string;
  key: string;
  name: string;
  status: MarketingCampaignStatus;
  channel: MarketingChannel;
  objective?: string | null;
  budget: string | number;
  spend: string | number;
  currency: string;
  attributionModel: string;
  startsAt?: string | null;
  endsAt?: string | null;
  metadata?: Record<string, unknown> | null;
  _count?: { attributions?: number; funnelEvents?: number };
};

export type MarketingAttribution = {
  id: string;
  type: MarketingAttributionType;
  source: string;
  medium?: string | null;
  touchpoint: string;
  landingPage?: string | null;
  conversionValue: string | number;
  occurredAt: string;
  campaign?: Pick<MarketingCampaign, "id" | "name" | "channel"> | null;
  lead?: { id: string; name: string; email?: string | null } | null;
  client?: { id: string; name: string; email: string } | null;
};

export type MarketingFunnelPoint = {
  stage: MarketingFunnelStage;
  count: number;
  value: string | number;
  rateFromPrevious: number;
};

export type MarketingOverview = {
  metrics: MarketingMetrics;
  campaigns: MarketingCampaign[];
  attribution: MarketingAttribution[];
  funnel: MarketingFunnelPoint[];
};
