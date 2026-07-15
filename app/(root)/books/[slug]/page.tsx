import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Mic } from "lucide-react";
import { getBookBySlug } from "@/lib/actions/book.actions";
import Image from "next/image";
import Link from "next/link";
import VapiControls from "@/components/VapiControls";

const BookDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { slug } = await params;
  const result = await getBookBySlug(slug);
  if (!result.success || !result.data) redirect("/");

  const book = result.data;

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating" aria-label="Back to library">
        <ArrowLeft className="size-5" />
      </Link>

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
              <button
                type="button"
                className="vapi-mic-btn vapi-mic-btn-inactive"
                aria-label="Start recording"
              >
                <Mic className="size-5" />
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
        <VapiControls book={book} />
      </div>
    </div>
  );
};

export default BookDetailPage;
