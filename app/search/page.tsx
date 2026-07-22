import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SearchBox } from "@/components/search-box";
import { TrackEvent } from "@/components/track-event";
import { searchProducts } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

// Queried per request from user input — never a build-time static page,
// and search results should not be indexed. Excluded from the static
// export build (see scripts/build-static.sh); the static header shows a
// disabled search note instead.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Taznee for sarees, salwar kameez, panjabi, wedding wear, and jewelry.",
  alternates: { canonical: absoluteUrl("/search") },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Search", path: "/search" }]} />
      <h1 className="font-serif text-3xl mb-4">Search</h1>

      <div className="max-w-xl">
        <SearchBox initialQuery={query} autoFocus />
      </div>

      {query && (
        <>
          <TrackEvent event="search" params={{ search_term: query }} />
          <p className="mt-6 text-sm text-charcoal/60">
            {results.length === 0
              ? `No results for "${query}".`
              : `${results.length} result${results.length === 1 ? "" : "s"} for "${query}".`}
          </p>

          {results.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-4 text-charcoal/70 text-sm">
              <p>Try a different term, or browse a category:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { href: "/category/sarees", label: "Sarees" },
                  { href: "/category/salwar-kameez", label: "Salwar Kameez" },
                  { href: "/category/panjabi", label: "Panjabi" },
                  { href: "/category/wedding", label: "Wedding" },
                  { href: "/category/jewelry", label: "Jewelry" },
                ].map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="rounded-full border border-charcoal/15 px-3 py-1 hover:border-burgundy hover:text-burgundy transition"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!query && (
        <p className="mt-6 text-charcoal/60 text-sm">
          Enter a term above to search products by name, description, or category.
        </p>
      )}
    </div>
  );
}
