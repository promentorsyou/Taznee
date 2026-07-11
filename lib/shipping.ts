/**
 * Shipping cost calculator.
 *
 * Taznee ships every order from Bangladesh to the customer's US address.
 * Cost is derived from a simple weight-banded rate table per shipping
 * zone (see prisma seed for the demo "Continental US" / "AK & HI" zones).
 * All rates are integer cents.
 */

export interface ShippingRateBand {
  minWeightGrams: number;
  maxWeightGrams: number;
  rateCents: number;
  transitMinDays: number;
  transitMaxDays: number;
}

export interface ShippingZoneTable {
  zoneName: string;
  states: string[]; // ISO-2 state/territory codes this zone covers, or ["*"] for catch-all
  bands: ShippingRateBand[];
}

export class ShippingError extends Error {}

/**
 * Finds the shipping zone that covers the given US state code.
 * Falls back to any zone whose `states` contains "*".
 */
export function findZoneForState(
  zones: ShippingZoneTable[],
  stateCode: string,
): ShippingZoneTable {
  const exact = zones.find((z) => z.states.includes(stateCode.toUpperCase()));
  if (exact) return exact;
  const wildcard = zones.find((z) => z.states.includes("*"));
  if (wildcard) return wildcard;
  throw new ShippingError(`No shipping zone configured for state "${stateCode}"`);
}

/**
 * Finds the rate band that covers the given parcel weight, in grams.
 */
export function findRateBand(zone: ShippingZoneTable, weightGrams: number): ShippingRateBand {
  if (weightGrams <= 0) throw new ShippingError("weightGrams must be > 0");
  const band = zone.bands.find(
    (b) => weightGrams >= b.minWeightGrams && weightGrams <= b.maxWeightGrams,
  );
  if (!band) {
    // fall back to the heaviest band (extrapolate) rather than fail checkout
    const heaviest = [...zone.bands].sort((a, b) => b.maxWeightGrams - a.maxWeightGrams)[0];
    if (!heaviest) throw new ShippingError(`Zone "${zone.zoneName}" has no rate bands configured`);
    return heaviest;
  }
  return band;
}

/**
 * Computes total shipping cost in cents for a set of parcel weights
 * shipping to a given US state. Each item's weight is summed, then a
 * single combined-parcel rate is looked up (Taznee consolidates
 * international shipments into one parcel per order).
 */
export function calculateShippingCents(
  zones: ShippingZoneTable[],
  stateCode: string,
  itemWeightsGrams: number[],
): { shippingCents: number; transitMinDays: number; transitMaxDays: number; zoneName: string } {
  if (itemWeightsGrams.length === 0) {
    throw new ShippingError("Cannot calculate shipping for an empty cart");
  }
  const totalWeight = itemWeightsGrams.reduce((sum, w) => sum + w, 0);
  const zone = findZoneForState(zones, stateCode);
  const band = findRateBand(zone, totalWeight);
  return {
    shippingCents: band.rateCents,
    transitMinDays: band.transitMinDays,
    transitMaxDays: band.transitMaxDays,
    zoneName: zone.zoneName,
  };
}
