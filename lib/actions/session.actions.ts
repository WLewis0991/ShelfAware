'use server';


import { connectToDatabase } from "@/database/mongoose";
import VoiceSession from "@/database/models/voiceSession.model";
import { getCurrentBillingPeriodStart } from "../subscription-constant";

export interface StartSessionResult {
    success: boolean;
    sessionId?: string;
    maxDurationMinutes?: number;
    error?: string;
    isBillingError?: boolean;
}

export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        //Check if there's an active session for this user and book

        const session = await VoiceSession.create({
            clerkId, bookId, startedAt: new Date(),
            billingPeriodStart: getCurrentBillingPeriodStart(),
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: session._id.toString(),
            //maxDurationMinutes: 30, Placeholder for now, can be dynamic based on subscription
        }

    }catch (e) {
        console.error('Error starting voice session', e);
        return {
            success: false,
            error: 'Failed to start voice session. Try again later.'
        }
    }

}