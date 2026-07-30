"use client";

import Link from "next/link";
import { useWishlist } from "@/components/wishlist-provider";
import { ProductCard, type ProductCardData } from "@/components/product-card";

/**
 * Saved-items page. Reads the same localStorage store as the heart toggles,
 * so the two can never disagree. Renders a stable skeleton until hydration
 * to keep the server HTML and first client paint in sync.
 */
export function SavedPageClient({ recommendations }: { recommendations: ProductCardData[] }) {
  const { items, hydrated, count } = useWishlist();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl">Saved Items</h1>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-md bg-charcoal/5" />
              <div className="mt-3 h-4 w-2/3 rounded bg-charcoal/5" />
            </div>
          ))}
        </div>
        <p className="sr-only">Loading your saved items…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl">Saved Items</h1>
        <div className="rounded-lg border border-charcoal/10 py-16 text-center">
          <p className="text-charcoal/60">You haven&apos;t saved anything yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-charcoal/45">
            Tap the heart on any piece to keep it here while you decide. Saved items stay on this
            device — no account needed.
          </p>
          <Link
            href="/category/sarees"
            className="mt-5 inline-block rounded-md bg-burgundy px-6 py-3 text-ivory transition hover:bg-burgundy/90"
          >
            Browse the collection
          </Link>
        </div>

        {recommendations.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 font-serif text-2xl">Popular right now</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {recommendations.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl">
        Saved Items <span className="text-2xl text-charcoal/40">({count})</span>
      </h1>
      <p className="mb-8 text-sm text-charcoal/55">
        Saved on this device. Tap a heart again to remove a piece.
      </p>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
