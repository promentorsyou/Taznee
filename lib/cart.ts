/**
 * Client-side cart model and persistence.
 *
 * The cart is intentionally CLIENT-side and guest-first: it lives in
 * localStorage so it survives refreshes and works identically in the live
 * app and the database-free static export. No sign-in is required to add
 * items — forcing account creation before the cart is a well-known
 * conversion killer on mobile.
 *
 * When Stripe + a server cart are enabled later, this store becomes the
 * source of truth that gets POSTed to the order API at checkout; nothing
 * here needs to change for that.
 *
 * Money is always integer cents (see lib/money.ts).
 */
import { lineTotalCents, sumCents } from "@/lib/money";

export const CART_STORAGE_KEY = "taznee.cart.v1";

/**
 * Client-visible twin of STATIC_EXPORT. Only NEXT_PUBLIC_* variables are
 * inlined into client bundles, so client components that must know whether
 * API routes exist in this build read this instead of STATIC_EXPORT.
 */
export const IS_STATIC_BUILD = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

/** A single line in the cart. Denormalised so the cart renders without a DB. */
export interface CartItem {
  /** Stable line key: variantId (falls back to slug+size+color). */
  id: string;
  productSlug: string;
  name: string;
  size: string;
  color: string;
  unitPriceCents: number;
  quantity: number;
  imageUrl: string | null;
  /** False when the variant was known to be unavailable at add time. */
  available: boolean;
  /**
   * Parcel weight per unit, used to look up the real shipping rate band at
   * checkout. Defaults to DEFAULT_ITEM_WEIGHT_GRAMS (the same default the
   * Product schema uses) when a product has no explicit weight.
   */
  weightGrams: number;
}

/** Mirrors the `weightGrams` default on the Product model. */
export const DEFAULT_ITEM_WEIGHT_GRAMS = 500;

export const MAX_QUANTITY_PER_LINE = 10;

/** Builds the stable line id for a variant selection. */
export function cartLineId(input: {
  variantId?: string | null;
  productSlug: string;
  size: string;
  color: string;
}): string {
  if (input.variantId) return input.variantId;
  return `${input.productSlug}::${input.size}::${input.color}`;
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  const whole = Math.floor(quantity);
  if (whole < 1) return 1;
  return Math.min(whole, MAX_QUANTITY_PER_LINE);
}

/**
 * Adds an item, merging into an existing line with the same id. Returns a
 * NEW array — never mutates, so React state updates behave predictably.
 * Quantity is clamped so a repeated click can't push a line past the cap.
 */
export function addItem(items: CartItem[], incoming: CartItem): CartItem[] {
  const existing = items.find((i) => i.id === incoming.id);
  if (!existing) {
    return [...items, { ...incoming, quantity: clampQuantity(incoming.quantity) }];
  }
  return items.map((i) =>
    i.id === incoming.id ? { ...i, quantity: clampQuantity(i.quantity + incoming.quantity) } : i,
  );
}

/** Sets an absolute quantity. Quantity <= 0 removes the line. */
export function setQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeItem(items, id);
  return items.map((i) => (i.id === id ? { ...i, quantity: clampQuantity(quantity) } : i));
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((i) => i.id !== id);
}

/** Total units across all lines — what the header badge shows. */
export function totalQuantity(items: CartItem[]): number {
  return sumCents(items.map((i) => i.quantity));
}

/**
 * Subtotal of purchasable lines only. Unavailable lines are excluded so
 * the total never implies a customer can buy something they can't.
 */
export function subtotalCents(items: CartItem[]): number {
  return sumCents(
    items.filter((i) => i.available).map((i) => lineTotalCents(i.unitPriceCents, i.quantity)),
  );
}

export function hasUnavailableItems(items: CartItem[]): boolean {
  return items.some((i) => !i.available);
}

/** Per-unit weights of purchasable lines, expanded by quantity. */
export function itemWeightsGrams(items: CartItem[]): number[] {
  const weights: number[] = [];
  for (const item of items) {
    if (!item.available) continue;
    for (let i = 0; i < item.quantity; i++) {
      weights.push(item.weightGrams || DEFAULT_ITEM_WEIGHT_GRAMS);
    }
  }
  return weights;
}

/**
 * Validates unknown parsed JSON into CartItems, dropping anything
 * malformed. localStorage is user-writable and may hold data from an older
 * build, so it is never trusted.
 */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const items: CartItem[] = [];
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as Record<string, unknown>;
    if (
      typeof e.id !== "string" ||
      typeof e.productSlug !== "string" ||
      typeof e.name !== "string" ||
      typeof e.unitPriceCents !== "number" ||
      !Number.isInteger(e.unitPriceCents) ||
      e.unitPriceCents < 0 ||
      typeof e.quantity !== "number"
    ) {
      continue;
    }
    items.push({
      id: e.id,
      productSlug: e.productSlug,
      name: e.name,
      size: typeof e.size === "string" ? e.size : "",
      color: typeof e.color === "string" ? e.color : "",
      unitPriceCents: e.unitPriceCents,
      quantity: clampQuantity(e.quantity),
      imageUrl: typeof e.imageUrl === "string" ? e.imageUrl : null,
      available: e.available !== false,
      weightGrams:
        typeof e.weightGrams === "number" && Number.isFinite(e.weightGrams) && e.weightGrams > 0
          ? e.weightGrams
          : DEFAULT_ITEM_WEIGHT_GRAMS,
    });
  }
  return items;
}
