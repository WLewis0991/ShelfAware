'use server';

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/mongoose";
import VoiceSession from "@/database/models/voiceSession.model";
import { getCurrentBillingPeriodStart } from "../subscription-constants";
import { checkSessionLimit } from "../plans";
import { EndSessionResult, StartSessionResult } from "@/types";

export const startVoiceSession = async (
    clerkId: string, 
    bookId: string): Promise<StartSessionResult> => {
    
        try {
            const { userId } = await auth();
            if (!userId || userId !== clerkId) {
                return { success: false, error: 'Not authenticated', isBillingError: false }
            }

            const { allowed, current, limit, maxDurationMinutes } = await checkSessionLimit(clerkId);

            if (!allowed) {
                return {
                    success: false,
                    error: `Monthly session limit reached (${current}/${limit}). Upgrade your plan for more sessions.`,
                    isBillingError: true,
                }
            }

            await connectToDatabase();

            const session = await VoiceSession.create({
                clerkId, bookId, startedAt: new Date(),
                billingPeriodStart: getCurrentBillingPeriodStart(),
                durationSeconds: 0,
            });

            return {
                success: true,
                sessionId: session._id.toString(),
                maxDurationMinutes,
            }

        }catch (e) {
            console.error('Error starting voice session', e);
            return {
                success: false,
                error: 'Failed to start voice session. Try again later.',
                isBillingError: false,
            }
        }

}

export const endVoiceSession = async (
  sessionId: string,
  durationSeconds: number,
): Promise<EndSessionResult> => {
  try {
    await connectToDatabase();

    const session = await VoiceSession.findByIdAndUpdate(
      sessionId,
      { endedAt: new Date(), durationSeconds },
    );

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    return { success: true };
  } catch (e) {
    console.error("Error ending voice session:", e);
    return { success: false, error : 'Failed to end voice session. Try again later.' };
  }
};
