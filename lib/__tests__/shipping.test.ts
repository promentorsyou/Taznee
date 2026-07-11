import { describe, expect, it } from "vitest";
import {
  calculateShippingCents,
  findRateBand,
  findZoneForState,
  ShippingError,
  type ShippingZoneTable,
} from "../shipping";

const zones: ShippingZoneTable[] = [
  {
    zoneName: "Continental US",
    states: [
      "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "ID", "IL", "IN", "IA",
      "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
      "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
      "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
    ],
    bands: [
      { minWeightGrams: 0, maxWeightGrams: 500, rateCents: 1500, transitMinDays: 5, transitMaxDays: 9 },
      { minWeightGrams: 501, maxWeightGrams: 1500, rateCents: 2500, transitMinDays: 5, transitMaxDays: 9 },
      { minWeightGrams: 1501, maxWeightGrams: 5000, rateCents: 4500, transitMinDays: 6, transitMaxDays: 10 },
    ],
  },
  {
    zoneName: "Alaska & Hawaii",
    states: ["AK", "HI"],
    bands: [
      { minWeightGrams: 0, maxWeightGrams: 500, rateCents: 2200, transitMinDays: 7, transitMaxDays: 12 },
      { minWeightGrams: 501, maxWeightGrams: 5000, rateCents: 3800, transitMinDays: 7, transitMaxDays: 12 },
    ],
  },
];

describe("findZoneForState", () => {
  it("finds the exact zone for a state code", () => {
    expect(findZoneForState(zones, "CA").zoneName).toBe("Continental US");
    expect(findZoneForState(zones, "hi").zoneName).toBe("Alaska & Hawaii");
  });

  it("throws when no zone matches and there is no wildcard", () => {
    expect(() => findZoneForState(zones, "ZZ")).toThrow(ShippingError);
  });
});

describe("findRateBand", () => {
  it("finds the band covering the given weight", () => {
    const zone = zones[0];
    expect(findRateBand(zone, 300).rateCents).toBe(1500);
    expect(findRateBand(zone, 1000).rateCents).toBe(2500);
  });

  it("falls back to the heaviest band for over-weight parcels", () => {
    const zone = zones[0];
    expect(findRateBand(zone, 100000).rateCents).toBe(4500);
  });

  it("throws for non-positive weight", () => {
    expect(() => findRateBand(zones[0], 0)).toThrow(ShippingError);
  });
});

describe("calculateShippingCents", () => {
  it("sums item weights and returns the matching rate + transit window", () => {
    const result = calculateShippingCents(zones, "NY", [300, 150]);
    expect(result.shippingCents).toBe(1500); // combined weight 450g -> 0-500g band
    expect(result.zoneName).toBe("Continental US");
  });

  it("computes correctly for a single light item", () => {
    const result = calculateShippingCents(zones, "TX", [200]);
    expect(result.shippingCents).toBe(1500);
    expect(result.transitMinDays).toBe(5);
    expect(result.transitMaxDays).toBe(9);
  });

  it("uses the AK/HI zone rate table", () => {
    const result = calculateShippingCents(zones, "AK", [400]);
    expect(result.shippingCents).toBe(2200);
  });

  it("throws for an empty cart", () => {
    expect(() => calculateShippingCents(zones, "NY", [])).toThrow(ShippingError);
  });
});
