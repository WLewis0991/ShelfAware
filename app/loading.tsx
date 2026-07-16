function SkeletonCard() {
  return (
    <div className="book-card animate-pulse">
      <div className="bg-[var(--surface-secondary)] rounded-lg aspect-[2/3]" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-[var(--surface-secondary)] rounded w-3/4" />
        <div className="h-3 bg-[var(--surface-secondary)] rounded w-1/2" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 bg-[var(--surface-secondary)] rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
