/**
 * Money helpers. All monetary amounts throughout Taznee are represented as
 * integer cents (USD) to avoid floating point rounding errors. Never use
 * Number/Float or JS division for currency math without rounding back to
 * an integer.
 */

export function centsToDisplay(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new Error("centsToDisplay expects an integer number of cents");
  }
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Applies a percentage-off discount (0-100) to a price in cents.
 * Rounds down (floor) to the nearest cent so the merchant never
 * under-charges due to rounding.
 */
export function applyPercentDiscount(priceCents: number, percentOff: number): number {
  if (priceCents < 0) throw new Error("priceCents must be >= 0");
  if (percentOff < 0 || percentOff > 100) {
    throw new Error("percentOff must be between 0 and 100");
  }
  const discounted = priceCents * (1 - percentOff / 100);
  return Math.floor(discounted);
}

/**
 * Returns the discount percentage implied by a compare-at ("original")
 * price vs. the actual selling price, rounded to the nearest whole percent.
 * Returns 0 if there is no discount or inputs are invalid.
 */
export function discountPercent(priceCents: number, compareAtCents?: number | null): number {
  if (!compareAtCents || compareAtCents <= priceCents) return 0;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Computes a line total (unit price * quantity) in integer cents.
 */
export function lineTotalCents(unitPriceCents: number, quantity: number): number {
  if (quantity < 0 || !Number.isInteger(quantity)) {
    throw new Error("quantity must be a non-negative integer");
  }
  return unitPriceCents * quantity;
}
