/**
 * Static-export-only variant of the category page, swapped in for
 * app/category/[slug]/page.tsx by scripts/build-static.sh. Static export
 * cannot statically render a Server Component that reads `searchParams`,
 * so this version drops the filter UI and just lists the category.
 */
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getCategoryPageData, getAllStaticSlugs } from "@/lib/catalog";

export async function generateStaticParams() {
  return getAllStaticSlugs().categorySlugs.map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const data = await getCategoryPageData(slug, {});
  if (!data) notFound();
  const { category, products } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl mb-2">{category.name}</h1>
      {category.description && <p className="text-charcoal/60 mb-8 max-w-2xl">{category.description}</p>}
      <p className="text-xs text-charcoal/40 mb-8">
        Filtering is available in the live deployment. This static preview shows the full category.
      </p>

      {products.length === 0 ? (
        <p className="text-charcoal/50">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
