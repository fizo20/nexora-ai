//src/config/ai-plan.config.ts
/**
 * AI Plan Configuration
 *
 * Defines AI limits per product tier.
 * This is application-level feature gating.
 *
 * You can later move this to DB if needed.
 */

export interface AIQuotaConfig {
  maxCallsPerMonth: number;
  maxInputTokensPerMonth: number;
  maxOutputTokensPerMonth: number;
}

export const AI_PLAN_LIMITS: Record<
  "FREE" | "PRO" | "ENTERPRISE",
  AIQuotaConfig
> = {
  FREE: {
    maxCallsPerMonth: 200,
    maxInputTokensPerMonth: 100_000,
    maxOutputTokensPerMonth: 100_000,
  },

  PRO: {
    maxCallsPerMonth: 2_000,
    maxInputTokensPerMonth: 2_000_000,
    maxOutputTokensPerMonth: 2_000_000,
  },

  ENTERPRISE: {
    maxCallsPerMonth: 100_000,
    maxInputTokensPerMonth: 100_000_000,
    maxOutputTokensPerMonth: 100_000_000,
  },
};
