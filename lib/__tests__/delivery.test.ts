import { describe, expect, it } from "vitest";
import {
  addBusinessDays,
  calculateDeliveryEstimate,
  mergeDeliveryEstimates,
} from "../delivery";

describe("addBusinessDays", () => {
  it("skips weekends when adding business days", () => {
    // Monday 2026-07-06 + 5 business days -> Monday 2026-07-13
    const monday = new Date(Date.UTC(2026, 6, 6));
    const result = addBusinessDays(monday, 5);
    expect(result.toISOString().slice(0, 10)).toBe("2026-07-13");
  });

  it("returns the same date for 0 business days", () => {
    const friday = new Date(Date.UTC(2026, 6, 10));
    const result = addBusinessDays(friday, 0);
    expect(result.toISOString().slice(0, 10)).toBe("2026-07-10");
  });

  it("skips a weekend that falls within a short range", () => {
    // Friday 2026-07-10 + 1 business day -> Monday 2026-07-13
    const friday = new Date(Date.UTC(2026, 6, 10));
    const result = addBusinessDays(friday, 1);
    expect(result.toISOString().slice(0, 10)).toBe("2026-07-13");
  });

  it("throws for negative business days", () => {
    expect(() => addBusinessDays(new Date(), -1)).toThrow();
  });
});

describe("calculateDeliveryEstimate", () => {
  const from = new Date(Date.UTC(2026, 6, 6)); // Monday

  it("adds processing + transit days for made-to-order items", () => {
    const est = calculateDeliveryEstimate({
      readyToShip: false,
      processingMinDays: 3,
      processingMaxDays: 5,
      transitMinDays: 5,
      transitMaxDays: 9,
      fromDate: from,
    });
    expect(est.totalMinDays).toBe(8);
    expect(est.totalMaxDays).toBe(14);
    expect(est.estimatedMinDate.getTime()).toBeGreaterThan(from.getTime());
  });

  it("skips processing time entirely for ready-to-ship items", () => {
    const est = calculateDeliveryEstimate({
      readyToShip: true,
      processingMinDays: 3,
      processingMaxDays: 5,
      transitMinDays: 5,
      transitMaxDays: 9,
      fromDate: from,
    });
    expect(est.processingMinDays).toBe(0);
    expect(est.processingMaxDays).toBe(0);
    expect(est.totalMinDays).toBe(5);
    expect(est.totalMaxDays).toBe(9);
  });

  it("throws when min exceeds max", () => {
    expect(() =>
      calculateDeliveryEstimate({
        readyToShip: false,
        processingMinDays: 10,
        processingMaxDays: 2,
        transitMinDays: 5,
        transitMaxDays: 9,
        fromDate: from,
      }),
    ).toThrow();
  });
});

describe("mergeDeliveryEstimates", () => {
  it("takes the slowest item across a merged order", () => {
    const fast = calculateDeliveryEstimate({
      readyToShip: true,
      processingMinDays: 0,
      processingMaxDays: 0,
      transitMinDays: 5,
      transitMaxDays: 9,
    });
    const slow = calculateDeliveryEstimate({
      readyToShip: false,
      processingMinDays: 7,
      processingMaxDays: 14,
      transitMinDays: 5,
      transitMaxDays: 9,
    });
    const merged = mergeDeliveryEstimates([fast, slow]);
    expect(merged.totalMinDays).toBe(slow.totalMinDays);
    expect(merged.totalMaxDays).toBe(slow.totalMaxDays);
  });

  it("throws for an empty list", () => {
    expect(() => mergeDeliveryEstimates([])).toThrow();
  });
});
