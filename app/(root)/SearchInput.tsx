"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export function SearchInput({ query }: { query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`${pathname}?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(pathname);
    }
  };

  const handleClear = () => {
    setValue("");
    router.push(pathname);
  };

  return (
    <form onSubmit={handleSubmit} className="library-search-wrapper">
      <Search className="ml-3 size-4 text-[var(--text-muted)] shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title or author..."
        className="library-search-input"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none"
        >
          &times;
        </button>
      )}
    </form>
  );
}
