/**
 * Static demo catalog used only for the GitHub Pages preview build
 * (STATIC_EXPORT=1). Mirrors the shape of prisma/seed.ts data but lives
 * in-memory so the site can be built with `next build --output export`
 * with no database. The live Vercel deployment always uses Postgres via
 * lib/catalog.ts instead.
 */

/**
 * Free-license (Pexels License — free for commercial use, no attribution
 * required: https://www.pexels.com/license/) stock photos of real garments,
 * matched by category/color to each demo product. Not photos of any real
 * Taznee inventory — this is placeholder photography for the demo catalog,
 * documented as such in the README.
 */
function img(pexelsPhotoId: number) {
  return `https://images.pexels.com/photos/${pexelsPhotoId}/pexels-photo-${pexelsPhotoId}.jpeg?auto=compress&cs=tinysrgb&w=800`;
}

export interface StaticCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface StaticDesigner {
  id: string;
  name: string;
  slug: string;
}

export interface StaticVariant {
  id: string;
  size: string;
  color: string;
  inStock: boolean;
}

export interface StaticProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  designerSlug: string | null;
  basePriceCents: number;
  compareAtCents: number | null;
  readyToShip: boolean;
  processingMinDays: number;
  processingMaxDays: number;
  transitMinDays: number;
  transitMaxDays: number;
  isFeatured: boolean;
  /** Optional shop-by-occasion tags (slugs from lib/occasions.ts). */
  occasions?: string[];
  images: { id: string; url: string; altText: string }[];
  variants: StaticVariant[];
}

export const STATIC_CATEGORIES: StaticCategory[] = [
  { id: "cat-sarees", name: "Sarees", slug: "sarees", description: "Hand-woven and embroidered sarees from Bangladeshi ateliers." },
  { id: "cat-salwar", name: "Salwar Kameez", slug: "salwar-kameez", description: "Everyday and occasion salwar kameez sets." },
  { id: "cat-panjabi", name: "Panjabi", slug: "panjabi", description: "Men's panjabi and kurta for festivals and daily wear." },
  { id: "cat-wedding", name: "Wedding", slug: "wedding", description: "Bridal and wedding-party ensembles." },
  { id: "cat-jewelry", name: "Jewelry", slug: "jewelry", description: "Traditional and contemporary jewelry pieces." },
];

export const STATIC_DESIGNERS: StaticDesigner[] = [
  { id: "des-meherun", name: "Meherun Studio", slug: "meherun-studio" },
  { id: "des-anindo", name: "Anindo Textiles", slug: "anindo-textiles" },
  { id: "des-nokshi", name: "Nokshi House", slug: "nokshi-house" },
  { id: "des-shonar", name: "Shonar Baksho", slug: "shonar-baksho" },
];

function variants(sizes: string[], colors: string[], prefix: string): StaticVariant[] {
  const out: StaticVariant[] = [];
  for (const s of sizes) {
    for (const c of colors) {
      out.push({ id: `${prefix}-${s}-${c}`, size: s, color: c, inStock: true });
    }
  }
  return out;
}

export const STATIC_PRODUCTS: StaticProduct[] = [
  {
    id: "prod-jamdani-ivory",
    slug: "ivory-jamdani-saree",
    name: "Ivory Jamdani Saree",
    description: "Hand-loomed Jamdani in ivory muslin with silver-thread motifs, woven in Narayanganj.",
    categorySlug: "sarees",
    designerSlug: "anindo-textiles",
    basePriceCents: 18900,
    compareAtCents: 22900,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 2,
    transitMinDays: 6,
    transitMaxDays: 10,
    isFeatured: true,
    occasions: ["wedding-guest", "reception"],
    images: [{ id: "img-1", url: img(10429558), altText: "Ivory Jamdani Saree" }],
    variants: variants(["Free Size"], ["Ivory", "Ivory/Gold"], "jamdani-ivory"),
  },
  {
    id: "prod-katan-maroon",
    slug: "maroon-katan-silk-saree",
    name: "Maroon Katan Silk Saree",
    description: "Rich katan silk with a woven gold border, suited for receptions and festive evenings.",
    categorySlug: "sarees",
    designerSlug: "anindo-textiles",
    basePriceCents: 24900,
    compareAtCents: null,
    readyToShip: false,
    processingMinDays: 10,
    processingMaxDays: 18,
    transitMinDays: 6,
    transitMaxDays: 10,
    isFeatured: true,
    occasions: ["reception", "wedding-guest"],
    images: [{ id: "img-2", url: img(11438526), altText: "Maroon Katan Silk Saree" }],
    variants: variants(["Free Size"], ["Maroon", "Deep Maroon"], "katan-maroon"),
  },
  {
    id: "prod-cotton-teal",
    slug: "teal-handblock-cotton-saree",
    name: "Teal Hand-Block Cotton Saree",
    description: "Breathable cotton saree with hand-block floral printing, ideal for daily and festive wear.",
    categorySlug: "sarees",
    designerSlug: "meherun-studio",
    basePriceCents: 8900,
    compareAtCents: 10900,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 3,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    occasions: ["eid"],
    images: [{ id: "img-3", url: img(11810731), altText: "Teal Hand-Block Cotton Saree" }],
    variants: variants(["Free Size"], ["Teal", "Teal/Ivory"], "cotton-teal"),
  },
  {
    id: "prod-3pc-rose",
    slug: "rose-embroidered-three-piece",
    name: "Rose Embroidered Three-Piece",
    description: "Unstitched three-piece set with thread embroidery on lawn cotton, includes dupatta.",
    categorySlug: "salwar-kameez",
    designerSlug: "nokshi-house",
    basePriceCents: 11900,
    compareAtCents: 13900,
    readyToShip: true,
    processingMinDays: 2,
    processingMaxDays: 4,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: true,
    occasions: ["eid", "wedding-guest"],
    images: [{ id: "img-4", url: img(20690508), altText: "Rose Embroidered Three-Piece" }],
    variants: variants(["S", "M", "L", "XL"], ["Rose", "Blush"], "3pc-rose"),
  },
  {
    id: "prod-3pc-navy",
    slug: "navy-chikankari-three-piece",
    name: "Navy Chikankari Three-Piece",
    description: "Hand-chikankari embroidered set on soft cambric, stitched to order.",
    categorySlug: "salwar-kameez",
    designerSlug: "nokshi-house",
    basePriceCents: 14900,
    compareAtCents: null,
    readyToShip: false,
    processingMinDays: 12,
    processingMaxDays: 20,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    occasions: ["wedding-guest", "nikkah"],
    images: [{ id: "img-5", url: img(1149962), altText: "Navy Chikankari Three-Piece" }],
    variants: variants(["S", "M", "L"], ["Navy"], "3pc-navy"),
  },
  {
    id: "prod-kurti-mustard",
    slug: "mustard-block-print-kurti",
    name: "Mustard Block-Print Kurti",
    description: "Relaxed-fit kurti in hand block-printed cotton, pairs well with jeans or salwar.",
    categorySlug: "salwar-kameez",
    designerSlug: "meherun-studio",
    basePriceCents: 5900,
    compareAtCents: 6900,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 3,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    images: [{ id: "img-6", url: img(19586661), altText: "Mustard Block-Print Kurti" }],
    variants: variants(["S", "M", "L", "XL"], ["Mustard"], "kurti-mustard"),
  },
  {
    id: "prod-panjabi-white",
    slug: "white-eid-panjabi",
    name: "White Eid Panjabi",
    description: "Classic white cotton panjabi with subtle self-stripe weave, tailored fit.",
    categorySlug: "panjabi",
    designerSlug: "meherun-studio",
    basePriceCents: 6900,
    compareAtCents: null,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 3,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: true,
    occasions: ["eid", "nikkah"],
    images: [{ id: "img-7", url: img(13222257), altText: "White Eid Panjabi" }],
    variants: variants(["S", "M", "L", "XL", "XXL"], ["White"], "panjabi-white"),
  },
  {
    id: "prod-panjabi-olive",
    slug: "olive-embroidered-panjabi",
    name: "Olive Embroidered Panjabi",
    description: "Olive linen-blend panjabi with hand embroidery along the placket, made to order.",
    categorySlug: "panjabi",
    designerSlug: "nokshi-house",
    basePriceCents: 8900,
    compareAtCents: 9900,
    readyToShip: false,
    processingMinDays: 8,
    processingMaxDays: 14,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    occasions: ["eid", "mehndi"],
    images: [{ id: "img-8", url: img(35542192), altText: "Olive Embroidered Panjabi" }],
    variants: variants(["M", "L", "XL"], ["Olive"], "panjabi-olive"),
  },
  {
    id: "prod-lehenga-crimson",
    slug: "crimson-bridal-lehenga",
    name: "Crimson Bridal Lehenga",
    description: "Heavily embellished bridal lehenga with zari and stonework, custom stitched.",
    categorySlug: "wedding",
    designerSlug: "nokshi-house",
    basePriceCents: 64900,
    compareAtCents: 74900,
    readyToShip: false,
    processingMinDays: 20,
    processingMaxDays: 30,
    transitMinDays: 6,
    transitMaxDays: 10,
    isFeatured: true,
    occasions: ["nikkah", "reception"],
    images: [{ id: "img-9", url: img(12411105), altText: "Crimson Bridal Lehenga" }],
    variants: variants(["S", "M", "L"], ["Crimson/Gold"], "lehenga-crimson"),
  },
  {
    id: "prod-sherwani-ivory",
    slug: "ivory-groom-sherwani",
    name: "Ivory Groom Sherwani",
    description: "Silk sherwani with gold buttons and matching churidar, tailored to measurements.",
    categorySlug: "wedding",
    designerSlug: "anindo-textiles",
    basePriceCents: 42900,
    compareAtCents: null,
    readyToShip: false,
    processingMinDays: 18,
    processingMaxDays: 25,
    transitMinDays: 6,
    transitMaxDays: 10,
    isFeatured: true,
    occasions: ["nikkah", "reception"],
    images: [{ id: "img-10", url: img(28758797), altText: "Ivory Groom Sherwani" }],
    variants: variants(["M", "L", "XL"], ["Ivory/Gold"], "sherwani-ivory"),
  },
  {
    id: "prod-holud-yellow",
    slug: "marigold-holud-set",
    name: "Marigold Holud Set",
    description: "Bright yellow cotton saree and blouse set styled for Holud ceremonies.",
    categorySlug: "wedding",
    designerSlug: "meherun-studio",
    basePriceCents: 9900,
    compareAtCents: 11900,
    readyToShip: true,
    processingMinDays: 2,
    processingMaxDays: 4,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    occasions: ["holud", "mehndi"],
    images: [{ id: "img-11", url: img(15384798), altText: "Marigold Holud Set" }],
    variants: variants(["Free Size"], ["Marigold"], "holud-yellow"),
  },
  {
    id: "prod-necklace-kundan",
    slug: "kundan-bridal-necklace-set",
    name: "Kundan Bridal Necklace Set",
    description: "Gold-plated kundan necklace with matching earrings and tikka, ready to ship.",
    categorySlug: "jewelry",
    designerSlug: "shonar-baksho",
    basePriceCents: 12900,
    compareAtCents: 14900,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 2,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: true,
    occasions: ["nikkah", "reception", "gifts"],
    images: [{ id: "img-12", url: img(9509032), altText: "Kundan Bridal Necklace Set" }],
    variants: variants(["One Size"], ["Gold"], "necklace-kundan"),
  },
  {
    id: "prod-bangles-gold",
    slug: "layered-gold-bangles",
    name: "Layered Gold Bangles",
    description: "Set of six gold-plated brass bangles with nakshi-inspired etching.",
    categorySlug: "jewelry",
    designerSlug: "shonar-baksho",
    basePriceCents: 4900,
    compareAtCents: null,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 2,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    occasions: ["gifts", "eid"],
    images: [{ id: "img-13", url: img(10030285), altText: "Layered Gold Bangles" }],
    variants: variants(["2.4in", "2.6in", "2.8in"], ["Gold"], "bangles-gold"),
  },
  {
    id: "prod-earrings-jhumka",
    slug: "pearl-jhumka-earrings",
    name: "Pearl Jhumka Earrings",
    description: "Traditional jhumka earrings with hanging pearl beads and gold-tone finish.",
    categorySlug: "jewelry",
    designerSlug: "shonar-baksho",
    basePriceCents: 3900,
    compareAtCents: 4900,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 2,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    occasions: ["gifts", "eid"],
    images: [{ id: "img-14", url: img(14523959), altText: "Pearl Jhumka Earrings" }],
    variants: variants(["One Size"], ["Gold/Pearl"], "earrings-jhumka"),
  },
  {
    id: "prod-dupatta-emerald",
    slug: "emerald-organza-dupatta",
    name: "Emerald Organza Dupatta",
    description: "Lightweight organza dupatta with hand-tacked sequin border.",
    categorySlug: "salwar-kameez",
    designerSlug: "nokshi-house",
    basePriceCents: 3400,
    compareAtCents: null,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 2,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    occasions: ["gifts"],
    images: [{ id: "img-15", url: img(8881954), altText: "Emerald Organza Dupatta" }],
    variants: variants(["One Size"], ["Emerald"], "dupatta-emerald"),
  },
  {
    id: "prod-fatua-indigo",
    slug: "indigo-linen-fatua",
    name: "Indigo Linen Fatua",
    description: "Short-length linen fatua for casual and semi-formal wear.",
    categorySlug: "panjabi",
    designerSlug: "meherun-studio",
    basePriceCents: 4400,
    compareAtCents: 4900,
    readyToShip: true,
    processingMinDays: 1,
    processingMaxDays: 3,
    transitMinDays: 5,
    transitMaxDays: 9,
    isFeatured: false,
    occasions: ["eid"],
    images: [{ id: "img-16", url: img(8621669), altText: "Indigo Linen Fatua" }],
    variants: variants(["S", "M", "L", "XL"], ["Indigo"], "fatua-indigo"),
  },
  {
    id: "prod-saree-tangail",
    slug: "sunset-tangail-saree",
    name: "Sunset Tangail Saree",
    description: "Traditional Tangail weave in a graduated sunset color palette.",
    categorySlug: "sarees",
    designerSlug: "anindo-textiles",
    basePriceCents: 15900,
    compareAtCents: null,
    readyToShip: false,
    processingMinDays: 9,
    processingMaxDays: 15,
    transitMinDays: 6,
    transitMaxDays: 10,
    isFeatured: false,
    occasions: ["wedding-guest", "eid"],
    images: [{ id: "img-17", url: img(36114634), altText: "Sunset Tangail Saree" }],
    variants: variants(["Free Size"], ["Sunset"], "tangail-sunset"),
  },
  {
    id: "prod-gown-blush",
    slug: "blush-reception-gown",
    name: "Blush Reception Gown",
    description: "Floor-length embellished gown for reception and party wear.",
    categorySlug: "wedding",
    designerSlug: "nokshi-house",
    basePriceCents: 21900,
    compareAtCents: 24900,
    readyToShip: false,
    processingMinDays: 14,
    processingMaxDays: 21,
    transitMinDays: 6,
    transitMaxDays: 10,
    isFeatured: false,
    occasions: ["reception"],
    images: [{ id: "img-18", url: img(14472206), altText: "Blush Reception Gown" }],
    variants: variants(["S", "M", "L"], ["Blush"], "gown-blush"),
  },
];

export function getStaticCategoryBySlug(slug: string) {
  return STATIC_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function getStaticProductBySlug(slug: string) {
  return STATIC_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function getStaticDesignerBySlug(slug: string | null) {
  if (!slug) return null;
  return STATIC_DESIGNERS.find((d) => d.slug === slug) ?? null;
}
