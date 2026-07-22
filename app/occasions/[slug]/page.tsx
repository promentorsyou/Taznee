import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getOccasionProducts } from "@/lib/catalog";
import { getOccasion } from "@/lib/occasions";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) return { title: "Occasion not found" };
  return {
    title: `${occasion.name} — Shop by Occasion`,
    description: occasion.description,
    alternates: { canonical: absoluteUrl(`/occasions/${slug}`) },
  };
}

export default async function OccasionPage({ params }: Params) {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) notFound();

  const products = await getOccasionProducts(slug);
  if (products === null) notFound();

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Occasions", path: "/occasions" },
    { name: occasion.name, path: `/occasions/${slug}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="font-serif text-3xl mb-2">{occasion.name}</h1>
      <p className="text-charcoal/60 mb-8 max-w-2xl">{occasion.description}</p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-charcoal/70 text-sm">
          <p>No pieces are tagged for {occasion.name} yet. Browse all occasions or a category instead.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/occasions" className="rounded-full border border-charcoal/15 px-3 py-1 hover:border-burgundy hover:text-burgundy transition">
              All occasions
            </Link>
            <Link href="/category/sarees" className="rounded-full border border-charcoal/15 px-3 py-1 hover:border-burgundy hover:text-burgundy transition">
              Sarees
            </Link>
            <Link href="/category/wedding" className="rounded-full border border-charcoal/15 px-3 py-1 hover:border-burgundy hover:text-burgundy transition">
              Wedding
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
