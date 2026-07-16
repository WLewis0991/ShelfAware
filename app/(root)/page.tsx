import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import { getAllBooks, searchBooks } from "@/lib/actions/book.actions";
import { SearchInput } from "./SearchInput";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const bookResults = query
    ? await searchBooks(query)
    : await getAllBooks();

  const books = bookResults.success ? (bookResults.data ?? []) : [];

  return (
    <div className="wrapper container">
      <HeroSection />

      <div className="library-filter-bar">
        <h2 className="section-title">Recent Books</h2>
        <SearchInput query={query} />
      </div>

      {books.length > 0 ? (
        <div className="library-books-grid">
          {books.map((book) => (
            <BookCard
              key={book._id}
              title={book.title}
              author={book.author}
              coverURL={book.coverURL}
              slug={book.slug}
            />
          ))}
        </div>
      ) : (
        <div className="library-empty-card text-center">
          <p className="text-lg font-medium text-[var(--text-secondary)]">
            {query ? `No books found for "${query}"` : "No books yet"}
          </p>
          {query && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Try a different search term.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
