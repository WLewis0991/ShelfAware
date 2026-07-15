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
        <VapiControls book={book} />
    </div>
  );
};

export default BookDetailPage;
