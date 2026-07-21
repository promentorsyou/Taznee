import { prisma } from "@/lib/prisma";
import { absoluteUrl, ORGANIZATION_NAME } from "@/lib/seo";

/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace) for the live
 * app. Product-level items (one per product). Availability maps ready-to-ship
 * -> in_stock and made-to-order -> preorder. These are original handmade
 * pieces without GTINs, so identifier_exists is "no" (the honest signal).
 *
 * Live app only — force-dynamic can't run under `output: export`, so this
 * route is excluded from the static GitHub Pages build (see build-static.sh).
 */
export const dynamic = "force-dynamic";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      designer: true,
      category: true,
    },
  });

  const items = products
    .filter((p) => p.images[0]?.url)
    .map((p) => {
      const price = (p.basePriceCents / 100).toFixed(2);
      const availability = p.readyToShip ? "in_stock" : "preorder";
      const brand = p.designer?.name ?? ORGANIZATION_NAME;
      return [
        "    <item>",
        `      <g:id>${xmlEscape(p.slug)}</g:id>`,
        `      <g:title>${xmlEscape(p.name)}</g:title>`,
        `      <g:description>${xmlEscape(p.description)}</g:description>`,
        `      <g:link>${xmlEscape(absoluteUrl(`/product/${p.slug}`))}</g:link>`,
        `      <g:image_link>${xmlEscape(p.images[0].url)}</g:image_link>`,
        `      <g:availability>${availability}</g:availability>`,
        `      <g:price>${price} USD</g:price>`,
        "      <g:condition>new</g:condition>",
        `      <g:brand>${xmlEscape(brand)}</g:brand>`,
        `      <g:product_type>${xmlEscape(p.category.name)}</g:product_type>`,
        "      <g:identifier_exists>no</g:identifier_exists>",
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xmlEscape(ORGANIZATION_NAME)}</title>
    <link>${xmlEscape(absoluteUrl("/"))}</link>
    <description>Original Bangladeshi fashion shipped to the United States.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
