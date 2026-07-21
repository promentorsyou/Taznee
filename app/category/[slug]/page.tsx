import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getCategoryPageData } from "@/lib/catalog";
import { absoluteUrl, breadcrumbSchema, type BreadcrumbItem } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    price?: string; // "min-max" in dollars
    size?: string;
    color?: string;
    readyToShip?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryPageData(slug, {});
  if (!data) return { title: "Category not found" };
  return {
    title: data.category.name,
    description: data.category.description ?? undefined,
    // Filtered variants (?size=, ?price=…) canonicalize to the base category.
    alternates: { canonical: absoluteUrl(`/category/${slug}`) },
  };
}

function categoryBreadcrumbs(name: string, slug: string): BreadcrumbItem[] {
  return [
    { name: "Home", path: "/" },
    { name, path: `/category/${slug}` },
  ];
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = await searchParams;

  const data = await getCategoryPageData(slug, filters);
  if (!data) notFound();
  const { category, products, sizes, colors } = data;

  function filterLink(next: Record<string, string | undefined>) {
    const qsParams = new URLSearchParams();
    const merged = { ...filters, ...next };
    for (const [k, v] of Object.entries(merged)) {
      if (v) qsParams.set(k, v);
    }
    const qs = qsParams.toString();
    return `/category/${slug}${qs ? `?${qs}` : ""}`;
  }

  const crumbs = categoryBreadcrumbs(category.name, slug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-serif text-3xl mb-2">{category.name}</h1>
      {category.description && <p className="text-charcoal/60 mb-8 max-w-2xl">{category.description}</p>}

      {/* leading-8 gives each filter link a ~32px-tall line box so the tap
          targets are comfortable on touch screens without changing layout. */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm leading-8 items-center">
        <div className="flex items-center gap-2">
          <span className="text-charcoal/50">Size:</span>
          <Link href={filterLink({ size: undefined })} className={!filters.size ? "text-burgundy" : ""}>All</Link>
          {sizes.map((s) => (
            <Link
              key={s}
              href={filterLink({ size: s })}
              className={filters.size === s ? "text-burgundy font-medium" : "hover:text-burgundy"}
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-charcoal/50">Color:</span>
          <Link href={filterLink({ color: undefined })} className={!filters.color ? "text-burgundy" : ""}>All</Link>
          {colors.map((c) => (
            <Link
              key={c}
              href={filterLink({ color: c })}
              className={filters.color === c ? "text-burgundy font-medium" : "hover:text-burgundy"}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-charcoal/50">Price:</span>
          {[
            { label: "Under $50", value: "0-50" },
            { label: "$50-$100", value: "50-100" },
            { label: "$100-$200", value: "100-200" },
            { label: "$200+", value: "200-100000" },
          ].map((p) => (
            <Link
              key={p.value}
              href={filterLink({ price: filters.price === p.value ? undefined : p.value })}
              className={filters.price === p.value ? "text-burgundy font-medium" : "hover:text-burgundy"}
            >
              {p.label}
            </Link>
          ))}
        </div>
        <Link
          href={filterLink({ readyToShip: filters.readyToShip === "true" ? undefined : "true" })}
          className={
            filters.readyToShip === "true"
              ? "text-forest font-medium border border-forest px-3 py-1 rounded-full"
              : "text-charcoal/50 border border-charcoal/20 px-3 py-1 rounded-full hover:border-forest"
          }
        >
          Ready to Ship Only
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-sm border-t border-charcoal/10 pt-4">
        <span className="text-charcoal/50">
          {products.length} {products.length === 1 ? "item" : "items"}
        </span>
        <div className="flex items-center gap-2 leading-8">
          <span className="text-charcoal/50">Sort:</span>
          {[
            { label: "Newest", value: undefined },
            { label: "Price: Low to High", value: "price-asc" },
            { label: "Price: High to Low", value: "price-desc" },
          ].map((s) => {
            const active = (filters.sort ?? undefined) === s.value;
            return (
              <Link
                key={s.label}
                href={filterLink({ sort: s.value })}
                className={active ? "text-burgundy font-medium" : "hover:text-burgundy"}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-charcoal/50">No products match these filters yet.</p>
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
