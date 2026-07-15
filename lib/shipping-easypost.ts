/**
 * EasyPost carrier-rate adapter. EasyPost aggregates USPS/UPS/FedEx/DHL
 * rates behind one API, which is why it's the default live provider here
 * rather than integrating a single carrier directly.
 *
 * Configure via environment variables (see .env.example):
 *   EASYPOST_API_KEY   — from https://www.easypost.com/ (test or production key)
 *   SHIP_FROM_NAME, SHIP_FROM_STREET1, SHIP_FROM_CITY, SHIP_FROM_STATE,
 *   SHIP_FROM_ZIP, SHIP_FROM_COUNTRY, SHIP_FROM_PHONE — the origin address
 *   (e.g. your Dhaka fulfillment address, or a US warehouse if you're using
 *   the bulk-import model described in the README).
 *
 * Nothing in this file is called unless EASYPOST_API_KEY is set — see
 * isEasyPostConfigured() below and lib/shipping-provider.ts, which is the
 * only caller.
 */
import EasyPostClient from "@easypost/api";

export interface ShipToAddress {
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string | null;
}

export interface EasyPostRate {
  shippingCents: number;
  transitMinDays: number;
  transitMaxDays: number;
  zoneName: string;
}

// Default parcel dimensions (inches) used when no per-product dimensions
// are recorded. Reasonable box size for folded garments; refine with real
// package dimensions per product once available (see Product schema —
// only weightGrams is tracked today, not L/W/H).
const DEFAULT_PARCEL_LENGTH_IN = 12;
const DEFAULT_PARCEL_WIDTH_IN = 10;
const DEFAULT_PARCEL_HEIGHT_IN = 4;
const GRAMS_PER_OUNCE = 28.3495;

let cachedClient: InstanceType<typeof EasyPostClient> | null = null;

function getClient(): InstanceType<typeof EasyPostClient> {
  if (!cachedClient) {
    cachedClient = new EasyPostClient(process.env.EASYPOST_API_KEY!);
  }
  return cachedClient;
}

export function isEasyPostConfigured(): boolean {
  return Boolean(process.env.EASYPOST_API_KEY);
}

function getFromAddress() {
  return {
    name: process.env.SHIP_FROM_NAME || "Taznee Fulfillment",
    street1: process.env.SHIP_FROM_STREET1 || "",
    city: process.env.SHIP_FROM_CITY || "",
    state: process.env.SHIP_FROM_STATE || undefined,
    zip: process.env.SHIP_FROM_ZIP || "",
    country: process.env.SHIP_FROM_COUNTRY || "BD",
    phone: process.env.SHIP_FROM_PHONE || undefined,
  };
}

/**
 * Fetches the cheapest available rate from EasyPost for a parcel of the
 * given total weight shipping to `toAddress`. Returns null (rather than
 * throwing) if EasyPost returns no usable rates, so the caller can fall
 * back to the static rate table; throws only on a hard API/network error,
 * which the caller also catches and falls back on.
 */
export async function getEasyPostRate(
  toAddress: ShipToAddress,
  itemWeightsGrams: number[],
): Promise<EasyPostRate | null> {
  const fromAddress = getFromAddress();
  if (!fromAddress.street1 || !fromAddress.city || !fromAddress.zip) {
    console.error(
      "EASYPOST_API_KEY is set but SHIP_FROM_STREET1/CITY/ZIP are not configured — skipping live rate lookup.",
    );
    return null;
  }

  const totalWeightGrams = itemWeightsGrams.reduce((sum, w) => sum + w, 0);
  const totalWeightOz = totalWeightGrams / GRAMS_PER_OUNCE;

  const client = getClient();
  const shipment = await client.Shipment.create({
    to_address: {
      name: toAddress.fullName,
      street1: toAddress.line1,
      street2: toAddress.line2 || undefined,
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.postalCode,
      country: toAddress.country || "US",
      phone: toAddress.phone || undefined,
    },
    from_address: fromAddress,
    parcel: {
      length: DEFAULT_PARCEL_LENGTH_IN,
      width: DEFAULT_PARCEL_WIDTH_IN,
      height: DEFAULT_PARCEL_HEIGHT_IN,
      weight: totalWeightOz,
    },
  });

  const rates = shipment.rates ?? [];
  if (rates.length === 0) return null;

  const cheapest = [...rates].sort((a, b) => Number(a.rate) - Number(b.rate))[0];
  const rateCents = Math.round(Number(cheapest.rate) * 100);
  const days = cheapest.delivery_days ?? null;

  return {
    shippingCents: rateCents,
    // EasyPost gives a single estimated transit-day figure (not a min/max
    // range) for most services — use it for both bounds, with a small pad
    // on the max side so the customer-facing estimate stays conservative.
    transitMinDays: days ?? 5,
    transitMaxDays: days ? days + 2 : 10,
    zoneName: `${cheapest.carrier} ${cheapest.service}`,
  };
}
