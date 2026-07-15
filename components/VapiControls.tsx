'use client'

import { Mic, MicOff } from "lucide-react"
import { IBook } from "@/types"
import { useVapi } from "@/hooks/useVapi"
import Image from "next/image"
import Transcript from "./Transcript"

const VapiControls = ({ book }: { book: IBook }) => {
  const{ status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearErrors, } = useVapi(book)

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
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
              <div className="vapi-cover-image flex items-center justify-center bg-[#d4c4a8] text-white font-bold text-lg">
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
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#212a3b] truncate">
              {book.title}
            </h1>
            <p className="text-[#5a4a3a] text-sm">by {book.author}</p>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready" />
                <span className="vapi-status-text">Ready</span>
              </span>
              <span className="vapi-status-indicator">
                <span className="vapi-status-text">
                  Voice: {book.persona || "Default"}
                </span>
              </span>
              <span className="vapi-status-indicator">
                <span className="vapi-status-text">0:00/15:00</span>
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
