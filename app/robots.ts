import type { MetadataRoute } from "next";
import { IS_INDEXABLE, SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Until the owner opts into indexing (NEXT_PUBLIC_INDEXABLE=true), block
  // all crawlers so the demo / static preview and any staging deploy are
  // never indexed or surfaced in search.
  if (!IS_INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/checkout", "/account", "/admin", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
