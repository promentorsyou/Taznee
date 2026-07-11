import { describe, expect, it } from "vitest";
import {
  applyPercentDiscount,
  centsToDisplay,
  discountPercent,
  dollarsToCents,
  lineTotalCents,
  sumCents,
} from "../money";

describe("centsToDisplay", () => {
  it("formats integer cents as USD currency", () => {
    expect(centsToDisplay(129900)).toBe("$1,299.00");
    expect(centsToDisplay(0)).toBe("$0.00");
    expect(centsToDisplay(5)).toBe("$0.05");
  });

  it("throws on non-integer input", () => {
    expect(() => centsToDisplay(19.5)).toThrow();
  });
});

describe("dollarsToCents", () => {
  it("converts dollars to cents", () => {
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(dollarsToCents(5)).toBe(500);
  });
});

describe("applyPercentDiscount", () => {
  it("applies a percent-off discount, rounding down", () => {
    expect(applyPercentDiscount(10000, 10)).toBe(9000);
    expect(applyPercentDiscount(999, 33)).toBe(669); // 999 * 0.67 = 669.33 -> floor
  });

  it("throws for out-of-range percentOff", () => {
    expect(() => applyPercentDiscount(1000, -1)).toThrow();
    expect(() => applyPercentDiscount(1000, 101)).toThrow();
  });
});

describe("discountPercent", () => {
  it("computes rounded discount percent from compareAt price", () => {
    expect(discountPercent(8000, 10000)).toBe(20);
    expect(discountPercent(10000, 10000)).toBe(0);
    expect(discountPercent(10000, null)).toBe(0);
    expect(discountPercent(10000, 9000)).toBe(0); // priceCents > compareAt -> not a discount
  });
});

describe("sumCents", () => {
  it("sums an array of cent amounts", () => {
    expect(sumCents([100, 200, 300])).toBe(600);
    expect(sumCents([])).toBe(0);
  });
});

describe("lineTotalCents", () => {
  it("multiplies unit price by quantity", () => {
    expect(lineTotalCents(2500, 3)).toBe(7500);
  });

  it("throws for negative or non-integer quantity", () => {
    expect(() => lineTotalCents(2500, -1)).toThrow();
    expect(() => lineTotalCents(2500, 1.5)).toThrow();
  });
});
