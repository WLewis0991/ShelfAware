'use client'

import { Mic } from "lucide-react"
import { Messages } from "@/types"
import { useEffect, useRef } from "react"

interface TranscriptProps {
  messages: Messages[]
  currentMessage: string
  currentUserMessage: string
}

const Transcript = ({ messages, currentMessage, currentUserMessage }: TranscriptProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentMessage, currentUserMessage])

  const isEmpty = messages.length === 0 && !currentMessage && !currentUserMessage

  if (isEmpty) {
    return (
      <div className="transcript-empty">
        <Mic className="size-12 text-[#8B7355] mb-2" />
        <p className="transcript-empty-text">No conversation yet</p>
        <p className="transcript-empty-hint">
          Click the mic button above to start talking
        </p>
      </div>
    )
  }

  return (
    <div className="transcript-messages">
      {messages.map((msg, i) => {
        const isUser = msg.role === "user"
        return (
          <div
            key={i}
            className={`transcript-message ${isUser ? "transcript-message-user" : "transcript-message-assistant"}`}
          >
            <div
              className={`transcript-bubble ${isUser ? "transcript-bubble-user" : "transcript-bubble-assistant"}`}
            >
              {msg.content}
            </div>
          </div>
        )
      })}

      {currentUserMessage && (
        <div className="transcript-message transcript-message-user">
          <div className="transcript-bubble transcript-bubble-user">
            {currentUserMessage}
            <span className="transcript-cursor" />
          </div>
        </div>
      )}

      {currentMessage && (
        <div className="transcript-message transcript-message-assistant">
          <div className="transcript-bubble transcript-bubble-assistant">
            {currentMessage}
            <span className="transcript-cursor" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default Transcript
