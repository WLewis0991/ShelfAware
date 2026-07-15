import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from "@/lib/constants";
import { IBook, Messages } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web"
import { getVoice } from "@/lib/utils";
import { startVoiceSession, endVoiceSession } from '@/lib/actions/session.actions';

export type CallStatus =
  | "idle"
  | "connecting"
  | "starting"
  | "listening"
  | "thinking"
  | "speaking";

const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
};

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY || "";

let vapi: InstanceType<typeof Vapi>;

function getVapi(): InstanceType<typeof Vapi> {
  if (!vapi) {
    if (!VAPI_API_KEY) {
      throw new Error('VAPI_API_KEY is not set in environment variables');
    }
    vapi = new Vapi(VAPI_API_KEY);
  }

  return vapi;
}


export const useVapi = (book: IBook) => {
  const { userId } = useAuth();
  // TODO: implement limits based on accounts.

  const [status, setStatus] = useState<CallStatus>("idle");
  const [messages, setMessages] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  const bookRef = useLatestRef(book);
  const durationRef = useLatestRef(duration);
  const voice = book.persona || DEFAULT_VOICE;

  const isActive =
    status === "listening" ||
    status === "thinking" ||
    status === "speaking" ||
    status === "starting";
  // Limits
  //const maxDurationRef =
  //const maxDurationSeconds
  //const remainingSeconds
  //showTimeWarning

  const start = async () => {
    if (!userId) return setLimitError('Please login to start a conversation.');

    setLimitError(null);
    setStatus('connecting');

    try {
      const result = await startVoiceSession(userId, bookRef.current._id);
      if (!result.success) {
        setLimitError(result.error || 'Session limit reached, please upgrade your plan.');
        setStatus('idle');
        return;
      }

      sessionIdRef.current = result.sessionId || null;

      const firstMessage = `Hey, good to meet you. Quick question, have you actually read ${book.title}? Or are you just skimming through it?`;

      await getVapi().start(ASSISTANT_ID, {
        firstMessage,
        variableValues: {
          title: book.title,
          author: book.author,
          bookId: book._id
        }, 
        //   voice : {
        //   provider: '11Labs' as const,
        //   voiceId: getVoice(voice).id,
        //   model: 'eleven_turbo_v2_5x' as const,
        //   stability: VOICE_SETTINGS.stability,
        //   similarityBoost: VOICE_SETTINGS.similarityBoost,
        //   style: VOICE_SETTINGS.style,
        //   useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
        // }
      })

    }catch (e) {
      console.error('Error starting call', e);
      setStatus('idle');
      setLimitError('An error occurred while starting the call');
    }
  };
  const stop = async () => {
    isStoppingRef.current = true;
    await getVapi().stop();
    isStoppingRef.current = false;
  };
  const clearErrors = async () => {};

  return {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    start,
    stop,
    clearErrors,
  };
};

export default useVapi;
