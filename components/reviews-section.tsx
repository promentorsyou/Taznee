import type { ReviewSummary, ReviewView } from "@/lib/reviews";

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className={`inline-flex ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="15" height="15" viewBox="0 0 24 24" className={n <= rounded ? "text-gold" : "text-charcoal/20"}>
          <path
            fill="currentColor"
            d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"
          />
        </svg>
      ))}
    </span>
  );
}

/**
 * Verified-only reviews block for the product page. Renders real APPROVED
 * reviews and their aggregate, or an honest empty state when there are none.
 * Never displays fabricated reviews or ratings.
 */
export function ReviewsSection({
  reviews,
  summary,
}: {
  reviews: ReviewView[];
  summary: ReviewSummary | null;
}) {
  return (
    <section className="mt-14 border-t border-charcoal/10 pt-8" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
        <h2 id="reviews-heading" className="font-serif text-2xl">
          Customer Reviews
        </h2>
        {summary && (
          <div className="flex items-center gap-2 text-sm">
            <Stars rating={summary.average} />
            <span className="font-medium">{summary.average.toFixed(1)}</span>
            <span className="text-charcoal/50">
              ({summary.count} {summary.count === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-charcoal/60 text-sm">
          No reviews yet. Verified reviews from customers who purchased this piece will appear here.
        </p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-charcoal/5 pb-6 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <Stars rating={r.rating} />
                {r.title && <span className="font-medium text-sm">{r.title}</span>}
              </div>
              <p className="text-charcoal/80 text-sm leading-relaxed">{r.body}</p>
              <p className="mt-2 text-xs text-charcoal/50">
                {r.authorName}
                {r.verifiedPurchase && <span className="text-forest"> · Verified purchase</span>}
                {" · "}
                {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
