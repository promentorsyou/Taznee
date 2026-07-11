/**
 * Static shipping zone/rate table used by both the seed script and the
 * checkout flow (kept in the DB via ShippingZone/ShippingRate, this file
 * is the canonical source used to seed those tables).
 */
import type { ShippingZoneTable } from "./shipping";

const CONTINENTAL_US_STATES = [
  "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
  "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

export const SHIPPING_ZONES: ShippingZoneTable[] = [
  {
    zoneName: "Continental US",
    states: CONTINENTAL_US_STATES,
    bands: [
      { minWeightGrams: 0, maxWeightGrams: 500, rateCents: 1500, transitMinDays: 5, transitMaxDays: 9 },
      { minWeightGrams: 501, maxWeightGrams: 1500, rateCents: 2500, transitMinDays: 5, transitMaxDays: 9 },
      { minWeightGrams: 1501, maxWeightGrams: 3000, rateCents: 3900, transitMinDays: 6, transitMaxDays: 10 },
      { minWeightGrams: 3001, maxWeightGrams: 8000, rateCents: 5900, transitMinDays: 6, transitMaxDays: 10 },
    ],
  },
  {
    zoneName: "Alaska & Hawaii",
    states: ["AK", "HI"],
    bands: [
      { minWeightGrams: 0, maxWeightGrams: 500, rateCents: 2200, transitMinDays: 7, transitMaxDays: 12 },
      { minWeightGrams: 501, maxWeightGrams: 1500, rateCents: 3400, transitMinDays: 7, transitMaxDays: 12 },
      { minWeightGrams: 1501, maxWeightGrams: 8000, rateCents: 5900, transitMinDays: 8, transitMaxDays: 13 },
    ],
  },
];
