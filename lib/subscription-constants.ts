export const PLANS = ['free', 'standard', 'pro'] as const;
export type PlanType = (typeof PLANS)[number];

export interface PlanLimits {
  maxBooks: number;
  maxSessionsPerMonth: number;
  maxSessionDurationMinutes: number;
  hasSessionHistory: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxBooks: 2,
    maxSessionsPerMonth: 5,
    maxSessionDurationMinutes: 5,
    hasSessionHistory: false,
  },
  standard: {
    maxBooks: 10,
    maxSessionsPerMonth: 100,
    maxSessionDurationMinutes: 15,
    hasSessionHistory: true,
  },
  pro: {
    maxBooks: 100,
    maxSessionsPerMonth: Infinity,
    maxSessionDurationMinutes: 60,
    hasSessionHistory: true,
  },
};

export const getCurrentBillingPeriodStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};
