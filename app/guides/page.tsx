import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { GUIDES } from "@/lib/guides";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Editorial guides to Bangladeshi fashion — Jamdani sarees, custom-stitching measurements, ready-to-ship vs. made-to-order, buying sarees in the USA, and wedding attire.",
  alternates: { canonical: absoluteUrl("/guides") },
};

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
];

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="font-serif text-3xl sm:text-4xl mb-3">Guides</h1>
      <p className="text-charcoal/60 max-w-2xl">
        Factual, practical reference articles on Bangladeshi fashion — how
        garments are made, how to choose and measure for them, and what to know
        when ordering from the United States.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="block border border-charcoal/10 rounded-lg p-6 hover:border-burgundy hover:shadow-sm transition"
          >
            <p className="text-[11px] uppercase tracking-[0.15em] text-gold mb-2">{g.kicker}</p>
            <h2 className="font-serif text-xl text-charcoal">{g.title}</h2>
            <p className="mt-2 text-sm text-charcoal/70 leading-relaxed">{g.description}</p>
            <span className="mt-3 inline-block text-sm text-burgundy">Read guide →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
