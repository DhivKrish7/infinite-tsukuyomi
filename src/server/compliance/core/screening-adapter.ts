import type {
  ScreeningCapability,
  ScreeningHealth,
  ScreeningProviderContext,
  ScreeningResult,
  ScreeningSubject
} from "./domain";

export type ScreeningProviderMetadata = {
  key: string;
  displayName: string;
  provider: string;
  version: string;
  capabilities: ScreeningCapability[];
};

export type ScreeningProviderAdapter = ScreeningProviderMetadata & {
  validateConfig: (input: {
    credentials: Record<string, unknown>;
    settings: Record<string, unknown>;
  }) => Promise<void> | void;
  healthCheck: (context: ScreeningProviderContext) => Promise<ScreeningHealth>;
  screenSubject: (context: ScreeningProviderContext, subject: ScreeningSubject) => Promise<ScreeningResult>;
  verifyWebhook?: (payload: unknown, signature?: string | null) => Promise<boolean> | boolean;
};
