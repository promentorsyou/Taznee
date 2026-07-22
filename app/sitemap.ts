import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { GUIDES } from "@/lib/guides";

// Rendered per-request, not at build time — it queries Prisma, and a
// DATABASE_URL may not be available at build time (e.g. in CI). Swapped
// for sitemap.static.ts by scripts/build-static.sh for the GitHub Pages
// export build, which has no database at all.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taznee.example.com";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true } }),
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/returns`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/guides`, changeFrequency: "monthly", priority: 0.5 },
    ...GUIDES.map((g) => ({
      url: `${siteUrl}/guides/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...categories.map((c) => ({
      url: `${siteUrl}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
