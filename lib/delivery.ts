/**
 * Delivery-estimate calculator.
 *
 * Combines a product's processing time (time to prepare/tailor the item in
 * Bangladesh, or 0 if ready-to-ship) with international transit time, both
 * expressed as business-day ranges. All day-counting skips weekends
 * (Saturday/Sunday). Public holidays are intentionally out of scope for
 * this MVP — see README "Known Limitations".
 */

export interface DeliveryEstimateInput {
  readyToShip: boolean;
  processingMinDays: number;
  processingMaxDays: number;
  transitMinDays: number;
  transitMaxDays: number;
  /** Defaults to "now" (new Date()) when omitted. */
  fromDate?: Date;
}

export interface DeliveryEstimate {
  processingMinDays: number;
  processingMaxDays: number;
  transitMinDays: number;
  transitMaxDays: number;
  totalMinDays: number;
  totalMaxDays: number;
  estimatedMinDate: Date;
  estimatedMaxDate: Date;
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Adds `businessDays` business days (Mon-Fri) to `startDate`, returning a
 * new Date. Operates on UTC calendar days to avoid timezone drift.
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  if (businessDays < 0) throw new Error("businessDays must be >= 0");
  const result = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()),
  );
  let remaining = businessDays;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    if (!isWeekend(result)) {
      remaining -= 1;
    }
  }
  return result;
}

/**
 * Computes a delivery date-range estimate for a single product, given its
 * processing and transit day ranges (see prisma schema fields of the same
 * name on Product). Ready-to-ship items skip the processing window
 * entirely.
 */
export function calculateDeliveryEstimate(input: DeliveryEstimateInput): DeliveryEstimate {
  const from = input.fromDate ?? new Date();
  const processingMinDays = input.readyToShip ? 0 : input.processingMinDays;
  const processingMaxDays = input.readyToShip ? 0 : input.processingMaxDays;

  if (processingMinDays > processingMaxDays) {
    throw new Error("processingMinDays cannot exceed processingMaxDays");
  }
  if (input.transitMinDays > input.transitMaxDays) {
    throw new Error("transitMinDays cannot exceed transitMaxDays");
  }

  const totalMinDays = processingMinDays + input.transitMinDays;
  const totalMaxDays = processingMaxDays + input.transitMaxDays;

  return {
    processingMinDays,
    processingMaxDays,
    transitMinDays: input.transitMinDays,
    transitMaxDays: input.transitMaxDays,
    totalMinDays,
    totalMaxDays,
    estimatedMinDate: addBusinessDays(from, totalMinDays),
    estimatedMaxDate: addBusinessDays(from, totalMaxDays),
  };
}

/**
 * Merges several per-item delivery estimates into a single order-level
 * estimate: the order ships together, so the slowest item's processing
 * time and transit time both govern.
 */
export function mergeDeliveryEstimates(estimates: DeliveryEstimate[]): DeliveryEstimate {
  if (estimates.length === 0) throw new Error("Cannot merge an empty estimate list");
  const totalMinDays = Math.max(...estimates.map((e) => e.totalMinDays));
  const totalMaxDays = Math.max(...estimates.map((e) => e.totalMaxDays));
  const processingMinDays = Math.max(...estimates.map((e) => e.processingMinDays));
  const processingMaxDays = Math.max(...estimates.map((e) => e.processingMaxDays));
  const transitMinDays = Math.max(...estimates.map((e) => e.transitMinDays));
  const transitMaxDays = Math.max(...estimates.map((e) => e.transitMaxDays));

  // Recompute dates from "now" using the merged totals for consistency.
  const now = new Date();
  return {
    processingMinDays,
    processingMaxDays,
    transitMinDays,
    transitMaxDays,
    totalMinDays,
    totalMaxDays,
    estimatedMinDate: addBusinessDays(now, totalMinDays),
    estimatedMaxDate: addBusinessDays(now, totalMaxDays),
  };
}

export function formatDateRange(min: Date, max: Date): string {
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${fmt.format(min)} – ${fmt.format(max)}`;
}
