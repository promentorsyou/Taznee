/**
 * Shop-by-occasion taxonomy. Occasion landing pages list ONLY products
 * that carry the matching tag in their `occasions` array (set on real
 * catalog records in prisma/seed.ts and the static fixture in
 * lib/static-data.ts) — nothing is fabricated at render time. If no
 * product is tagged for an occasion, its page shows an honest empty state.
 *
 * Slugs here must match the strings used in product `occasions` arrays.
 */
export interface Occasion {
  slug: string;
  name: string;
  /** Short, factual blurb — no pricing, stock, or shipping promises. */
  description: string;
}

export const OCCASIONS: Occasion[] = [
  {
    slug: "eid",
    name: "Eid",
    description:
      "Festive pieces for Eid celebrations — from crisp panjabi to bright, occasion-ready sets.",
  },
  {
    slug: "holud",
    name: "Holud",
    description:
      "Bright, celebratory looks for the gaye holud, where yellows and warm tones are traditional.",
  },
  {
    slug: "mehndi",
    name: "Mehndi",
    description: "Colourful, comfortable outfits for mehndi and pre-wedding festivities.",
  },
  {
    slug: "nikkah",
    name: "Nikkah",
    description: "Refined attire for the nikkah ceremony, for the couple and their families.",
  },
  {
    slug: "wedding-guest",
    name: "Wedding Guest",
    description: "Elegant sarees and sets to wear as a guest — festive without overshadowing the couple.",
  },
  {
    slug: "reception",
    name: "Reception",
    description: "Polished, dressed-up pieces for the reception and evening celebrations.",
  },
  {
    slug: "gifts",
    name: "Gifts",
    description: "Jewelry and accessories that make thoughtful gifts for someone special.",
  },
];

export function getOccasion(slug: string): Occasion | undefined {
  return OCCASIONS.find((o) => o.slug === slug);
}
