/**
 * Saved items ("wishlist") model and persistence.
 *
 * Guest-first and client-side, exactly like the cart: saving a piece is a
 * low-commitment action and must not be gated behind account creation.
 * Entries are stored in localStorage so they survive refreshes and work in
 * both the live app and the static export.
 *
 * The Prisma `Wishlist`/`WishlistItem` models exist for the signed-in case;
 * this store is the source of truth that can be merged into them once
 * accounts and server sync are wired up.
 */
import type { ProductCardData } from "@/components/product-card";

export const WISHLIST_STORAGE_KEY = "taznee.wishlist.v1";

/** A saved product, denormalised so the list renders without a database. */
export type WishlistItem = ProductCardData;

export function isSaved(items: WishlistItem[], slug: string): boolean {
  return items.some((i) => i.slug === slug);
}

/** Adds if absent, removes if present. Returns a new array. */
export function toggleItem(items: WishlistItem[], item: WishlistItem): WishlistItem[] {
  if (isSaved(items, item.slug)) {
    return items.filter((i) => i.slug !== item.slug);
  }
  // Newest first — most recently saved is the most relevant.
  return [item, ...items];
}

export function removeItem(items: WishlistItem[], slug: string): WishlistItem[] {
  return items.filter((i) => i.slug !== slug);
}

/**
 * Validates unknown parsed JSON into WishlistItems, dropping anything
 * malformed. localStorage is user-writable and may hold data written by an
 * older build, so it is never trusted.
 */
export function parseStoredWishlist(raw: string | null): WishlistItem[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const items: WishlistItem[] = [];
  const seen = new Set<string>();
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as Record<string, unknown>;
    if (
      typeof e.slug !== "string" ||
      typeof e.name !== "string" ||
      typeof e.basePriceCents !== "number" ||
      !Number.isInteger(e.basePriceCents) ||
      e.basePriceCents < 0 ||
      seen.has(e.slug)
    ) {
      continue;
    }
    seen.add(e.slug);
    items.push({
      slug: e.slug,
      name: e.name,
      basePriceCents: e.basePriceCents,
      compareAtCents:
        typeof e.compareAtCents === "number" && Number.isInteger(e.compareAtCents)
          ? e.compareAtCents
          : null,
      readyToShip: e.readyToShip === true,
      imageUrl: typeof e.imageUrl === "string" ? e.imageUrl : null,
      designerName: typeof e.designerName === "string" ? e.designerName : null,
    });
  }
  return items;
}
