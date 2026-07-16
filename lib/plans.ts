import { auth } from '@clerk/nextjs/server';
import {
  PlanType,
  PLAN_LIMITS,
  PlanLimits,
  getCurrentBillingPeriodStart,
} from './subscription-constants';
import { connectToDatabase } from '@/database/mongoose';
import Book from '@/database/models/book.model';
import VoiceSession from '@/database/models/voiceSession.model';

export async function getUserPlan(): Promise<PlanType> {
  const { has } = await auth();
  if (has({ plan: 'pro' })) return 'pro';
  if (has({ plan: 'standard' })) return 'standard';
  return 'free';
}

export async function getPlanLimits(): Promise<PlanLimits> {
  const plan = await getUserPlan();
  return PLAN_LIMITS[plan];
}

export async function checkBookLimit(clerkId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
}> {
  const plan = await getUserPlan();
  const limits = PLAN_LIMITS[plan];

  await connectToDatabase();

  const bookCount = await Book.countDocuments({ clerkId });

  return {
    allowed: bookCount < limits.maxBooks,
    current: bookCount,
    limit: limits.maxBooks,
  };
}

export async function checkSessionLimit(clerkId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  maxDurationMinutes: number;
}> {
  const plan = await getUserPlan();
  const limits = PLAN_LIMITS[plan];

  if (limits.maxSessionsPerMonth === Infinity) {
    return {
      allowed: true,
      current: 0,
      limit: Infinity,
      maxDurationMinutes: limits.maxSessionDurationMinutes,
    };
  }

  await connectToDatabase();

  const billingPeriodStart = getCurrentBillingPeriodStart();
  const sessionCount = await VoiceSession.countDocuments({
    clerkId,
    billingPeriodStart,
  });

  return {
    allowed: sessionCount < limits.maxSessionsPerMonth,
    current: sessionCount,
    limit: limits.maxSessionsPerMonth,
    maxDurationMinutes: limits.maxSessionDurationMinutes,
  };
}
