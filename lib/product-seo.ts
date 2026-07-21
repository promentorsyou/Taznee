/**
 * Shared SEO derivations for the product detail page, used by both the
 * dynamic (app/product/[slug]/page.tsx) and static-export
 * (page.static.tsx) variants so metadata, breadcrumbs, and JSON-LD stay
 * identical across builds.
 */
import type { Metadata } from "next";
import {
  absoluteUrl,
  breadcrumbSchema,
  productSchema,
  type BreadcrumbItem,
} from "@/lib/seo";

interface ProductLike {
  slug: string;
  name: string;
  description: string;
  basePriceCents: number;
  readyToShip: boolean;
  id: string;
  images: { url: string }[];
  category: { name: string; slug: string };
  designer: { name: string } | null;
}

export function productBreadcrumbs(product: ProductLike): BreadcrumbItem[] {
  return [
    { name: "Home", path: "/" },
    { name: product.category.name, path: `/category/${product.category.slug}` },
    { name: product.name, path: `/product/${product.slug}` },
  ];
}

export function productMetadata(product: ProductLike): Metadata {
  const description = product.description.slice(0, 155);
  const canonical = absoluteUrl(`/product/${product.slug}`);
  const imageUrl = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: product.name,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

/** Product + BreadcrumbList structured data for the product page. */
export function productJsonLd(
  product: ProductLike,
  reviewSummary?: { average: number; count: number } | null,
): Record<string, unknown>[] {
  return [
    productSchema({
      slug: product.slug,
      name: product.name,
      description: product.description,
      basePriceCents: product.basePriceCents,
      readyToShip: product.readyToShip,
      imageUrls: product.images.map((i) => i.url),
      brandName: product.designer?.name ?? "Taznee",
      categoryName: product.category.name,
      sku: product.id,
      aggregateRating: reviewSummary
        ? { ratingValue: reviewSummary.average, reviewCount: reviewSummary.count }
        : undefined,
    }),
    breadcrumbSchema(productBreadcrumbs(product)),
  ];
}
