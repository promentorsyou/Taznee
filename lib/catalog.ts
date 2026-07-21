/**
 * Catalog data access. Reads from Postgres via Prisma normally; when
 * STATIC_EXPORT=1 (the GitHub Pages preview build) it reads from the
 * in-memory fixture in lib/static-data.ts instead, since that build has
 * no database and no server runtime.
 */
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  STATIC_CATEGORIES,
  STATIC_PRODUCTS,
  getStaticCategoryBySlug,
  getStaticProductBySlug,
  getStaticDesignerBySlug,
  type StaticProduct,
} from "@/lib/static-data";
import type { ProductCardData } from "@/components/product-card";

export const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";

function toCardData(p: StaticProduct): ProductCardData {
  return {
    slug: p.slug,
    name: p.name,
    basePriceCents: p.basePriceCents,
    compareAtCents: p.compareAtCents,
    readyToShip: p.readyToShip,
    imageUrl: p.images[0]?.url ?? null,
    designerName: getStaticDesignerBySlug(p.designerSlug)?.name ?? null,
  };
}

export async function getHomepageData() {
  if (STATIC_EXPORT) {
    return {
      categories: STATIC_CATEGORIES.slice(0, 5),
      featured: STATIC_PRODUCTS.filter((p) => p.isFeatured)
        .slice(0, 8)
        .map(toCardData),
    };
  }

  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 5 }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, designer: true },
      take: 8,
    }),
  ]);

  return {
    categories,
    featured: featured.map((p) => ({
      slug: p.slug,
      name: p.name,
      basePriceCents: p.basePriceCents,
      compareAtCents: p.compareAtCents,
      readyToShip: p.readyToShip,
      imageUrl: p.images[0]?.url ?? null,
      designerName: p.designer?.name,
    })),
  };
}

export interface CategoryFilters {
  price?: string;
  size?: string;
  color?: string;
  readyToShip?: string;
}

export const getCategoryPageData = cache(async (slug: string, filters: CategoryFilters) => {
  if (STATIC_EXPORT) {
    const category = getStaticCategoryBySlug(slug);
    if (!category) return null;

    let products = STATIC_PRODUCTS.filter((p) => p.categorySlug === slug);

    if (filters.readyToShip === "true") {
      products = products.filter((p) => p.readyToShip);
    }
    if (filters.price) {
      const [minStr, maxStr] = filters.price.split("-");
      const min = Number(minStr);
      const max = Number(maxStr);
      products = products.filter((p) => {
        if (Number.isFinite(min) && p.basePriceCents < Math.round(min * 100)) return false;
        if (Number.isFinite(max) && p.basePriceCents > Math.round(max * 100)) return false;
        return true;
      });
    }
    if (filters.size) {
      products = products.filter((p) => p.variants.some((v) => v.size === filters.size));
    }
    if (filters.color) {
      products = products.filter((p) => p.variants.some((v) => v.color === filters.color));
    }

    const allVariantsInCategory = STATIC_PRODUCTS.filter((p) => p.categorySlug === slug).flatMap(
      (p) => p.variants,
    );
    const sizes = [...new Set(allVariantsInCategory.map((v) => v.size))];
    const colors = [...new Set(allVariantsInCategory.map((v) => v.color))];

    return {
      category,
      products: products.map(toCardData),
      sizes,
      colors,
    };
  }

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;

  const where: Prisma.ProductWhereInput = {
    categoryId: category.id,
    isActive: true,
  };

  if (filters.readyToShip === "true") {
    where.readyToShip = true;
  }
  if (filters.price) {
    const [minStr, maxStr] = filters.price.split("-");
    const min = Number(minStr);
    const max = Number(maxStr);
    where.basePriceCents = {
      ...(Number.isFinite(min) ? { gte: Math.round(min * 100) } : {}),
      ...(Number.isFinite(max) ? { lte: Math.round(max * 100) } : {}),
    };
  }
  if (filters.size || filters.color) {
    where.variants = {
      some: {
        ...(filters.size ? { size: filters.size } : {}),
        ...(filters.color ? { color: filters.color } : {}),
      },
    };
  }

  const [products, sizes, colors] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" }, take: 1 }, designer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.productVariant.findMany({
      where: { product: { categoryId: category.id } },
      distinct: ["size"],
      select: { size: true },
    }),
    prisma.productVariant.findMany({
      where: { product: { categoryId: category.id } },
      distinct: ["color"],
      select: { color: true },
    }),
  ]);

  return {
    category,
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      basePriceCents: p.basePriceCents,
      compareAtCents: p.compareAtCents,
      readyToShip: p.readyToShip,
      imageUrl: p.images[0]?.url ?? null,
      designerName: p.designer?.name,
    })),
    sizes: sizes.map((s) => s.size),
    colors: colors.map((c) => c.color),
  };
});

export const getProductDetailData = cache(async (slug: string) => {
  if (STATIC_EXPORT) {
    const product = getStaticProductBySlug(slug);
    if (!product) return null;
    const category = getStaticCategoryBySlug(product.categorySlug);
    const designer = getStaticDesignerBySlug(product.designerSlug);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      basePriceCents: product.basePriceCents,
      compareAtCents: product.compareAtCents,
      readyToShip: product.readyToShip,
      processingMinDays: product.processingMinDays,
      processingMaxDays: product.processingMaxDays,
      transitMinDays: product.transitMinDays,
      transitMaxDays: product.transitMaxDays,
      images: product.images,
      category: { name: category?.name ?? "", slug: product.categorySlug },
      designer: designer ? { name: designer.name } : null,
      variants: product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, inStock: v.inStock })),
    };
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { include: { inventory: true } },
      designer: true,
      category: true,
    },
  });
  if (!product || !product.isActive) return null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    basePriceCents: product.basePriceCents,
    compareAtCents: product.compareAtCents,
    readyToShip: product.readyToShip,
    processingMinDays: product.processingMinDays,
    processingMaxDays: product.processingMaxDays,
    transitMinDays: product.transitMinDays,
    transitMaxDays: product.transitMaxDays,
    images: product.images,
    category: { name: product.category.name, slug: product.category.slug },
    designer: product.designer ? { name: product.designer.name } : null,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      inStock: (v.inventory?.quantity ?? 0) > 0,
    })),
  };
});

export function getAllStaticSlugs() {
  return {
    categorySlugs: STATIC_CATEGORIES.map((c) => c.slug),
    productSlugs: STATIC_PRODUCTS.map((p) => p.slug),
  };
}
