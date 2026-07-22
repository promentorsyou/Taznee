import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { OCCASIONS } from "@/lib/occasions";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop by Occasion",
  description:
    "Shop Bangladeshi fashion by occasion — Eid, Holud, Mehndi, Nikkah, wedding guest, reception, and gifts.",
  alternates: { canonical: absoluteUrl("/occasions") },
};

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Occasions", path: "/occasions" },
];

export default function OccasionsIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="font-serif text-3xl sm:text-4xl mb-3">Shop by Occasion</h1>
      <p className="text-charcoal/60 max-w-2xl">
        Find pieces suited to the moment — from Eid and wedding festivities to
        gifting. Each page shows the products tagged for that occasion.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {OCCASIONS.map((o) => (
          <Link
            key={o.slug}
            href={`/occasions/${o.slug}`}
            className="block border border-charcoal/10 rounded-lg p-5 hover:border-burgundy hover:shadow-sm transition"
          >
            <h2 className="font-serif text-xl text-charcoal">{o.name}</h2>
            <p className="mt-1 text-sm text-charcoal/70 leading-relaxed">{o.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
