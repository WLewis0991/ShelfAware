'use client'

import { Mic } from "lucide-react"
import { IBook } from "@/types"
import { useVapi } from "@/hooks/useVapi"

const VapiControls = ({ book }: { book: IBook }) => {
  const{ status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearErrors, } = useVapi(book)

  return (
    <div>
      <div className="transcript-container min-h-100">
        <div className="transcript-empty">
          <Mic className="size-12 text-[#8B7355] mb-2" />
          <p className="transcript-empty-text">No conversation yet</p>
          <p className="transcript-empty-hint">
            Click the mic button above to start talking
          </p>
        </div>
      </div>
    </div>
  )
}

export default VapiControls
