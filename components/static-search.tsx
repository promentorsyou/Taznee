"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { SearchBox } from "@/components/search-box";
import { NAV_LINKS } from "@/lib/nav-links";

export interface StaticSearchEntry {
  card: ProductCardData;
  /** Lower-cased name + description + category, matched by substring. */
  haystack: string;
}

/** In-browser product search for the static (GitHub Pages) build. */
export function StaticSearch({ index }: { index: StaticSearchEntry[] }) {
  const query = (useSearchParams().get("q") ?? "").trim();
  const needle = query.toLowerCase();
  const results = needle ? index.filter((e) => e.haystack.includes(needle)).map((e) => e.card) : [];

  return (
    <>
      <div className="max-w-xl">
        {/* key: reset the field when the query in the URL changes */}
        <SearchBox key={query} initialQuery={query} />
      </div>

      {!query && (
        <p className="mt-6 text-charcoal/60 text-sm">
          Enter a term above to search products by name, description, or category.
        </p>
      )}

      {query && (
        <p className="mt-6 text-sm text-charcoal/60" role="status">
          {results.length === 0
            ? `No results for "${query}".`
            : `${results.length} result${results.length === 1 ? "" : "s"} for "${query}".`}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="mt-4 text-charcoal/70 text-sm">
          <p>Try a different term, or browse a category:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NAV_LINKS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-full border border-charcoal/15 px-3 py-2 hover:border-burgundy hover:text-burgundy transition"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
