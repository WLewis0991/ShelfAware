'use client'

import { Mic, MicOff, AlertTriangle } from "lucide-react"
import { IBook } from "@/types"
import { useVapi } from "@/hooks/useVapi"
import Image from "next/image"
import Link from "next/link"
import Transcript from "./Transcript"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const VapiControls = ({ book }: { book: IBook }) => {
  const router = useRouter()
  const {
    status, isActive, messages, currentMessage, currentUserMessage,
    duration, maxDurationMinutes, limitError,
    start, stop, clearErrors,
  } = useVapi(book)

  useEffect(() => {
    if (limitError?.startsWith("Time limit reached")) {
      const timer = setTimeout(() => router.push("/"), 3000)
      return () => clearTimeout(timer)
    }
  }, [limitError, router])

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {limitError && (
          <div className="warning-banner">
            <div className="warning-banner-content">
              <AlertTriangle className="warning-banner-icon" />
              <span className="warning-banner-text">{limitError}</span>
            </div>
            {limitError.startsWith("Time limit reached") && (
              <p className="text-sm text-[var(--text-secondary)] mt-1 ml-7">
                Redirecting to <Link href="/" className="underline font-medium">homepage</Link>...
              </p>
            )}
            {!limitError.startsWith("Time limit reached") && (
              <button onClick={clearErrors} className="text-sm text-[var(--accent-warm)] underline ml-7 mt-1">
                Dismiss
              </button>
            )}
          </div>
        )}

        <div className="vapi-header-card">
          <div className="vapi-cover-wrapper">
            {book.coverURL ? (
              <Image
                src={book.coverURL}
                alt={book.title}
                width={130}
                height={195}
                className="vapi-cover-image"
              />
            ) : (
              <div className="vapi-cover-image flex items-center justify-center bg-[var(--text-muted)] text-white font-bold text-lg">
                {book.title.charAt(0)}
              </div>
            )}
            <div className="vapi-mic-wrapper">
              {isActive && <span className="vapi-pulse-ring" />}
              <button
                onClick={isActive ? stop : start}
                disabled={status === 'connecting'}
                type="button"
                className={`vapi-mic-btn ${isActive ? "vapi-mic-btn-active" : "vapi-mic-btn-inactive"}`}
                aria-label={isActive ? "Stop recording" : "Start recording"}
              >
                {isActive ? <MicOff className="size-5 text-white" /> : <Mic className="size-5" />}
              </button>
            </div>
          </div>
          

          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] truncate">
              {book.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">by {book.author}</p>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="vapi-status-indicator">
                <span className={`vapi-status-dot vapi-status-dot-${status}`} />
                <span className="vapi-status-text">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </span>
              <span className="vapi-status-indicator">
                <span className="vapi-status-text">
                  Voice: {book.persona || "Default"}
                </span>
              </span>
              <span className="vapi-status-indicator">
                <span className="vapi-status-text">
                  {formatDuration(duration)}/{formatDuration(maxDurationMinutes * 60)}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="transcript-container vapi-transcript-wrapper">
          <Transcript
            messages={messages}
            currentMessage={currentMessage}
            currentUserMessage={currentUserMessage}
          />
        </div>
      </div>
    </>
  )
}

export default VapiControls
