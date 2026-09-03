import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from "@/lib/constants";
import { IBook, Messages, VapiMessage } from "@/types";
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

  const [status, setStatus] = useState<CallStatus>("idle");
  const [messages, setMessages] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [maxDurationMinutes, setMaxDuration] = useState(5);

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

  const isActiveRef = useLatestRef(isActive);

  useEffect(() => {
    const vapiInstance = getVapi();

    const handleMessage = (message: VapiMessage) => {
      if (!message || !message.type) return;

      if (message.type === "transcript") {
        const { role, transcript, transcriptType } = message;

        if (role === "user") {
          if (transcriptType === "partial") {
            setCurrentUserMessage(transcript);
          } else if (transcriptType === "final") {
            setCurrentUserMessage("");
            setStatus("thinking");
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "user" && last?.content === transcript) return prev;
              return [...prev, { role: "user", content: transcript }];
            });
          }
        } else if (role === "assistant") {
          if (transcriptType === "partial") {
            setCurrentMessage(transcript);
          } else if (transcriptType === "final") {
            setCurrentMessage("");
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last?.content === transcript) return prev;
              return [...prev, { role: "assistant", content: transcript }];
            });
          }
        }
      } else if (message.type === "status-update") {
        if (message.status === "ended") {
          setStatus("idle");
        } else if (message.status === "listening") {
          setStatus("listening");
        } else if (message.status === "thinking") {
          setStatus("thinking");
        } else if (message.status === "speaking") {
          setStatus("speaking");
        } else if (message.status === "connecting") {
          setStatus("connecting");
        }
      }
    };

    const handleCallStart = () => {
      setStatus("listening");
    };

    const handleCallEnd = () => {
      setStatus("idle");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (startTimerRef.current) {
        clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
      if (sessionIdRef.current) {
        endVoiceSession(sessionIdRef.current, durationRef.current);
        sessionIdRef.current = null;
      }
    };

    vapiInstance.on("message", handleMessage);
    vapiInstance.on("call-start", handleCallStart);
    vapiInstance.on("call-end", handleCallEnd);

    return () => {
      vapiInstance.off("message", handleMessage);
      vapiInstance.off("call-start", handleCallStart);
      vapiInstance.off("call-end", handleCallEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status === "listening" || status === "speaking" || status === "thinking") {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  const start = async () => {
    if (!userId) return setLimitError('Please login to start a conversation.');

    setLimitError(null);
    setStatus('connecting');
    setDuration(0);

    try {
      const result = await startVoiceSession(userId, bookRef.current._id);
      if (!result.success) {
        setLimitError(result.error || 'Session limit reached, please upgrade your plan.');
        setStatus('idle');
        return;
      }

      sessionIdRef.current = result.sessionId || null;
      const maxMinutes = result.maxDurationMinutes ?? 5;
      setMaxDuration(maxMinutes);

      const firstMessage = `Hey, good to meet you. Quick question, have you actually read ${book.title}? Or are you just skimming through it?`;

      await getVapi().start(ASSISTANT_ID, {
        firstMessage,
        variableValues: {
          title: book.title,
          author: book.author,
          bookId: book._id
        }, 
          voice : {
          provider: '11labs' as const,
          voiceId: getVoice(voice).id,
          model: 'eleven_turbo_v2_5' as const,
          stability: VOICE_SETTINGS.stability,
          similarityBoost: VOICE_SETTINGS.similarityBoost,
          style: VOICE_SETTINGS.style,
          useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
        }
      });

      const maxDurationMs = maxMinutes * 60 * 1000;
      startTimerRef.current = setTimeout(() => {
        if (isActiveRef.current && sessionIdRef.current) {
          stop();
          setLimitError(`Time limit reached. Your plan allows ${maxMinutes} minute sessions.`);
        }
      }, maxDurationMs);

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

  const clearErrors = () => setLimitError(null);

  const timeLimitExceeded = limitError?.startsWith("Time limit reached") ?? false;

  return {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    maxDurationMinutes,
    limitError,
    timeLimitExceeded,
    start,
    stop,
    clearErrors,
  };
};

export default useVapi;
