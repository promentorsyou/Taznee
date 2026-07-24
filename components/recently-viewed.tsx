"use client";

import { useEffect, useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/product-card";

/**
 * "Recently viewed" strip, backed by localStorage.
 *
 * Records the product currently being viewed, then renders the previously
 * seen ones (excluding the current page). Purely a browsing convenience —
 * it stores only product data already public on the site, never anything
 * about the person.
 */
const STORAGE_KEY = "taznee.recentlyViewed.v1";
const MAX_ITEMS = 8;

function readStored(): ProductCardData[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is ProductCardData =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as ProductCardData).slug === "string" &&
        typeof (p as ProductCardData).name === "string" &&
        typeof (p as ProductCardData).basePriceCents === "number",
    );
  } catch {
    return [];
  }
}

export function RecentlyViewed({ current }: { current: ProductCardData }) {
  const [others, setOthers] = useState<ProductCardData[]>([]);

  // localStorage is a browser-only external store; reading it during render
  // would break hydration, so this one-time sync happens after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = readStored();
    // Show what was viewed before this page…
    setOthers(stored.filter((p) => p.slug !== current.slug).slice(0, MAX_ITEMS));
    // …then record the current product at the front for next time.
    const next = [current, ...stored.filter((p) => p.slug !== current.slug)].slice(0, MAX_ITEMS);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode) — the feature simply no-ops.
    }
  }, [current]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (others.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-5 font-serif text-2xl">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {others.slice(0, 4).map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
