"use client";

import { useEffect } from "react";
import Link from "next/link";
import { centsToDisplay } from "@/lib/money";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart-provider";
import { CartLineItem } from "@/components/cart-line-item";
import { ProductCard, type ProductCardData } from "@/components/product-card";

/**
 * Full bag page. Shares the same localStorage cart as the drawer, so the
 * two can never disagree.
 *
 * Totals are deliberately honest: the subtotal is real, but shipping and
 * tax are shown as "calculated at checkout" rather than as invented
 * numbers, because the rate depends on the destination address.
 */
export function CartPageClient({ recommendations }: { recommendations: ProductCardData[] }) {
  const { items, hydrated, count, subtotal, hasUnavailable, clear } = useCart();

  useEffect(() => {
    if (hydrated && items.length > 0) {
      track("view_cart", { currency: "USD", value: subtotal / 100 });
    }
    // Fire once per mount after hydration, not on every quantity tweak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Before hydration we cannot know the cart contents; render a stable
  // skeleton so the server HTML and first client paint match.
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl">Your Bag</h1>
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-28 rounded bg-charcoal/5" />
          <div className="h-28 rounded bg-charcoal/5" />
        </div>
        <p className="sr-only">Loading your bag…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl">Your Bag</h1>
        <div className="rounded-lg border border-charcoal/10 py-16 text-center">
          <p className="text-charcoal/60">Your bag is empty.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-charcoal/45">
            Pieces you add are saved on this device, so you can come back and finish later.
          </p>
          <Link
            href="/category/sarees"
            className="mt-5 inline-block rounded-md bg-burgundy px-6 py-3 text-ivory transition hover:bg-burgundy/90"
          >
            Start shopping
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
      <h1 className="mb-8 font-serif text-3xl">
        Your Bag <span className="text-charcoal/40 text-2xl">({count})</span>
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            {items.map((item) => (
              <CartLineItem key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <Link href="/category/sarees" className="text-sm text-burgundy hover:underline">
              ← Continue shopping
            </Link>
            <button
              type="button"
              onClick={clear}
              className="text-sm text-charcoal/50 hover:text-burgundy hover:underline"
            >
              Clear bag
            </button>
          </div>
        </div>

        {/* Order summary. Sticky on desktop so the checkout button stays
            reachable while scrolling a long bag. */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-charcoal/15 p-5">
            <h2 className="mb-4 font-serif text-lg">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Subtotal</dt>
                <dd className="font-medium tabular-nums">{centsToDisplay(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Shipping</dt>
                <dd className="text-charcoal/50">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Taxes &amp; duties</dt>
                <dd className="text-charcoal/50">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between border-t border-charcoal/10 pt-3 text-base">
                <dt className="font-medium">Estimated total</dt>
                <dd className="font-medium tabular-nums">{centsToDisplay(subtotal)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-charcoal/45">
              Estimated total excludes shipping and any taxes or duties, which are added once you
              enter a delivery address.
            </p>

            {hasUnavailable && (
              <p className="mt-3 rounded bg-burgundy/10 px-3 py-2 text-xs text-burgundy">
                Remove the unavailable item(s) above before checking out.
              </p>
            )}

            <Link
              href="/checkout"
              aria-disabled={hasUnavailable}
              onClick={(e) => {
                if (hasUnavailable) e.preventDefault();
              }}
              className={`mt-5 block rounded-md py-3.5 text-center transition ${
                hasUnavailable
                  ? "cursor-not-allowed bg-charcoal/20 text-charcoal/50"
                  : "bg-burgundy text-ivory hover:bg-burgundy/90"
              }`}
            >
              Proceed to Checkout
            </Link>
          </div>
        </aside>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-serif text-2xl">You may also like</h2>
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
