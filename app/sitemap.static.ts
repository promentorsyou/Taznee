/**
 * Static-export-only sitemap, swapped in for app/sitemap.ts by
 * scripts/build-static.sh. Uses the in-memory fixture instead of Prisma —
 * the GitHub Pages export build has no database at all.
 */
import type { MetadataRoute } from "next";
import { getAllStaticSlugs } from "@/lib/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taznee.example.com";
  const { categorySlugs, productSlugs } = getAllStaticSlugs();

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    ...categorySlugs.map((slug) => ({
      url: `${siteUrl}/category/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...productSlugs.map((slug) => ({
      url: `${siteUrl}/product/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
