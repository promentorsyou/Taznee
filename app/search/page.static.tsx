/**
 * Static-export variant of the search page, swapped in by
 * scripts/build-static.sh. There is no server to query, so the full
 * (small) catalog is embedded at build time and filtered in the browser
 * by components/static-search.tsx — same fields as the live search
 * (name, description, category).
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StaticSearch } from "@/components/static-search";
import { getStaticSearchIndex } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Taznee for sarees, salwar kameez, panjabi, wedding wear, and jewelry.",
  alternates: { canonical: absoluteUrl("/search") },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Search", path: "/search" }]} />
      <h1 className="font-serif text-3xl mb-4">Search</h1>
      <Suspense fallback={null}>
        <StaticSearch index={getStaticSearchIndex()} />
      </Suspense>
    </div>
  );
}
