/**
 * Central SEO helpers: canonical URL building, indexability gate, and
 * JSON-LD schema builders. Keeping this in one place ensures the price,
 * availability, and return-policy data emitted in structured data stays
 * consistent with what the visible pages and checkout show.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taznee.example.com";

/**
 * Whether search engines may index the site. Defaults to FALSE so the demo
 * / static preview and any staging deploy are never indexed. The owner sets
 * NEXT_PUBLIC_INDEXABLE=true only at real launch, once a functioning
 * purchase path, real product photography, and legal pages are in place.
 */
export const IS_INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "true";

export const ORGANIZATION_NAME = "Taznee";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "care@taznee.com";

/** Return window in days — must match app/returns/page.tsx. */
export const RETURN_WINDOW_DAYS = 14;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Make an image URL absolute (Pexels URLs are already absolute; pass through). */
function absoluteImage(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return absoluteUrl(url);
}

type Json = Record<string, unknown>;

export function organizationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    email: SUPPORT_EMAIL,
    description:
      "Taznee ships original Bangladeshi fashion — sarees, salwar kameez, panjabi, wedding wear, and jewelry — from Bangladeshi designers to customers across the United States.",
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORGANIZATION_NAME,
    url: SITE_URL,
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface ProductSchemaInput {
  slug: string;
  name: string;
  description: string;
  basePriceCents: number;
  readyToShip: boolean;
  imageUrls: string[];
  brandName: string;
  categoryName: string;
  sku: string;
}

/**
 * Product + Offer + MerchantReturnPolicy structured data. No AggregateRating
 * is emitted — Taznee has no real review data yet, and inventing one would
 * be a schema-spam violation. Return-policy terms mirror app/returns:
 * ready-to-ship items are returnable within RETURN_WINDOW_DAYS with
 * customer-paid return shipping; made-to-order items are final sale.
 */
export function productSchema(input: ProductSchemaInput): Json {
  const priceDollars = (input.basePriceCents / 100).toFixed(2);

  const returnPolicy: Json = input.readyToShip
    ? {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: RETURN_WINDOW_DAYS,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      }
    : {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: input.imageUrls.map(absoluteImage),
    sku: input.sku,
    category: input.categoryName,
    brand: { "@type": "Brand", name: input.brandName },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${input.slug}`),
      priceCurrency: "USD",
      price: priceDollars,
      itemCondition: "https://schema.org/NewCondition",
      availability: input.readyToShip
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      hasMerchantReturnPolicy: returnPolicy,
    },
  };
}
