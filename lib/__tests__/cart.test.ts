import { describe, expect, it } from "vitest";
import {
  DEFAULT_ITEM_WEIGHT_GRAMS,
  MAX_QUANTITY_PER_LINE,
  addItem,
  cartLineId,
  hasUnavailableItems,
  itemWeightsGrams,
  parseStoredCart,
  removeItem,
  setQuantity,
  subtotalCents,
  totalQuantity,
  type CartItem,
} from "@/lib/cart";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "v1",
    productSlug: "ivory-jamdani-saree",
    name: "Ivory Jamdani Saree",
    size: "Free Size",
    color: "Ivory",
    unitPriceCents: 18900,
    quantity: 1,
    imageUrl: null,
    available: true,
    weightGrams: DEFAULT_ITEM_WEIGHT_GRAMS,
    ...overrides,
  };
}

describe("cartLineId", () => {
  it("prefers the variant id when present", () => {
    expect(cartLineId({ variantId: "var-1", productSlug: "a", size: "M", color: "Red" })).toBe("var-1");
  });

  it("falls back to a composite key without a variant id", () => {
    expect(cartLineId({ productSlug: "a", size: "M", color: "Red" })).toBe("a::M::Red");
  });
});

describe("addItem", () => {
  it("appends a new line", () => {
    expect(addItem([], item())).toHaveLength(1);
  });

  it("merges quantities into an existing line", () => {
    const cart = addItem([item({ quantity: 2 })], item({ quantity: 3 }));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(5);
  });

  it("clamps a merged quantity to the per-line maximum", () => {
    const cart = addItem([item({ quantity: MAX_QUANTITY_PER_LINE })], item({ quantity: 5 }));
    expect(cart[0].quantity).toBe(MAX_QUANTITY_PER_LINE);
  });

  it("does not mutate the input array", () => {
    const original = [item()];
    addItem(original, item({ id: "v2" }));
    expect(original).toHaveLength(1);
  });
});

describe("setQuantity", () => {
  it("updates the matching line", () => {
    expect(setQuantity([item()], "v1", 4)[0].quantity).toBe(4);
  });

  it("removes the line when quantity drops to zero", () => {
    expect(setQuantity([item()], "v1", 0)).toHaveLength(0);
  });

  it("clamps above the maximum", () => {
    expect(setQuantity([item()], "v1", 999)[0].quantity).toBe(MAX_QUANTITY_PER_LINE);
  });
});

describe("removeItem", () => {
  it("drops only the matching line", () => {
    const cart = removeItem([item(), item({ id: "v2" })], "v1");
    expect(cart.map((i) => i.id)).toEqual(["v2"]);
  });
});

describe("totals", () => {
  it("sums quantities across lines", () => {
    expect(totalQuantity([item({ quantity: 2 }), item({ id: "v2", quantity: 3 })])).toBe(5);
  });

  it("computes the subtotal in integer cents", () => {
    expect(subtotalCents([item({ quantity: 2 })])).toBe(37800);
  });

  it("excludes unavailable lines from the subtotal", () => {
    const cart = [item(), item({ id: "v2", available: false, unitPriceCents: 5000 })];
    expect(subtotalCents(cart)).toBe(18900);
  });

  it("flags carts containing unavailable lines", () => {
    expect(hasUnavailableItems([item()])).toBe(false);
    expect(hasUnavailableItems([item({ available: false })])).toBe(true);
  });
});

describe("itemWeightsGrams", () => {
  it("expands weights by quantity and skips unavailable lines", () => {
    const cart = [item({ quantity: 2, weightGrams: 600 }), item({ id: "v2", available: false })];
    expect(itemWeightsGrams(cart)).toEqual([600, 600]);
  });
});

describe("parseStoredCart", () => {
  it("returns an empty cart for null or invalid JSON", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("not json")).toEqual([]);
    expect(parseStoredCart('{"not":"an array"}')).toEqual([]);
  });

  it("drops malformed entries but keeps valid ones", () => {
    const raw = JSON.stringify([item(), { id: "bad" }, null, 42]);
    const parsed = parseStoredCart(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe("v1");
  });

  it("rejects non-integer or negative prices", () => {
    expect(parseStoredCart(JSON.stringify([item({ unitPriceCents: 10.5 })]))).toEqual([]);
    expect(parseStoredCart(JSON.stringify([item({ unitPriceCents: -100 })]))).toEqual([]);
  });

  it("clamps a tampered quantity", () => {
    const parsed = parseStoredCart(JSON.stringify([item({ quantity: 9999 })]));
    expect(parsed[0].quantity).toBe(MAX_QUANTITY_PER_LINE);
  });

  it("defaults a missing weight to the schema default", () => {
    const stored = { ...item() } as Partial<CartItem>;
    delete stored.weightGrams;
    const parsed = parseStoredCart(JSON.stringify([stored]));
    expect(parsed[0].weightGrams).toBe(DEFAULT_ITEM_WEIGHT_GRAMS);
  });
});
