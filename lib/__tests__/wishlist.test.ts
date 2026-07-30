import { describe, expect, it } from "vitest";
import {
  isSaved,
  parseStoredWishlist,
  removeItem,
  toggleItem,
  type WishlistItem,
} from "@/lib/wishlist";

function item(overrides: Partial<WishlistItem> = {}): WishlistItem {
  return {
    slug: "ivory-jamdani-saree",
    name: "Ivory Jamdani Saree",
    basePriceCents: 18900,
    compareAtCents: null,
    readyToShip: true,
    imageUrl: null,
    designerName: null,
    ...overrides,
  };
}

describe("toggleItem", () => {
  it("adds an unsaved item to the front", () => {
    const list = toggleItem([item({ slug: "other" })], item());
    expect(list[0].slug).toBe("ivory-jamdani-saree");
    expect(list).toHaveLength(2);
  });

  it("removes an already-saved item", () => {
    expect(toggleItem([item()], item())).toHaveLength(0);
  });

  it("does not mutate the input array", () => {
    const original = [item()];
    toggleItem(original, item({ slug: "another" }));
    expect(original).toHaveLength(1);
  });
});

describe("isSaved / removeItem", () => {
  it("detects saved slugs", () => {
    expect(isSaved([item()], "ivory-jamdani-saree")).toBe(true);
    expect(isSaved([item()], "nope")).toBe(false);
  });

  it("removes only the matching slug", () => {
    const list = removeItem([item(), item({ slug: "keep" })], "ivory-jamdani-saree");
    expect(list.map((i) => i.slug)).toEqual(["keep"]);
  });
});

describe("parseStoredWishlist", () => {
  it("returns empty for null or invalid JSON", () => {
    expect(parseStoredWishlist(null)).toEqual([]);
    expect(parseStoredWishlist("nope")).toEqual([]);
    expect(parseStoredWishlist('{"a":1}')).toEqual([]);
  });

  it("drops malformed entries", () => {
    const raw = JSON.stringify([item(), { slug: "no-name" }, null, 7]);
    expect(parseStoredWishlist(raw)).toHaveLength(1);
  });

  it("rejects non-integer or negative prices", () => {
    expect(parseStoredWishlist(JSON.stringify([item({ basePriceCents: 1.5 })]))).toEqual([]);
    expect(parseStoredWishlist(JSON.stringify([item({ basePriceCents: -1 })]))).toEqual([]);
  });

  it("de-duplicates repeated slugs", () => {
    expect(parseStoredWishlist(JSON.stringify([item(), item()]))).toHaveLength(1);
  });

  it("coerces missing optional fields to safe defaults", () => {
    const parsed = parseStoredWishlist(
      JSON.stringify([{ slug: "a", name: "A", basePriceCents: 100 }]),
    );
    expect(parsed[0]).toMatchObject({
      compareAtCents: null,
      readyToShip: false,
      imageUrl: null,
      designerName: null,
    });
  });
});
