/**
 * Shared loading skeletons. Every block reserves the same dimensions as
 * the content it stands in for, so the page doesn't shift when data lands.
 */

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-md bg-charcoal/10" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-1/3 rounded bg-charcoal/10" />
        <div className="h-4 w-2/3 rounded bg-charcoal/10" />
        <div className="h-4 w-1/4 rounded bg-charcoal/10" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TextLineSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-charcoal/10 ${className}`} />;
}
