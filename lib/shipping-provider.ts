/**
 * Live-carrier shipping quote orchestrator.
 *
 * Tries a real carrier-rate provider (currently EasyPost, which aggregates
 * USPS/UPS/FedEx/DHL) when EASYPOST_API_KEY is configured, and falls back
 * to the static weight/zone rate table (lib/shipping.ts) whenever the
 * provider isn't configured, the destination address is incomplete, or the
 * live API call fails for any reason. Checkout must never be blocked by a
 * third-party outage — degrade to the static estimate instead.
 */
import { calculateShippingCents, type ShippingZoneTable } from "@/lib/shipping";
import { getEasyPostRate, isEasyPostConfigured, type ShipToAddress } from "@/lib/shipping-easypost";

export interface ShippingQuote {
  shippingCents: number;
  transitMinDays: number;
  transitMaxDays: number;
  zoneName: string;
  /** Which provider produced this quote — surfaced for debugging/observability. */
  source: "easypost" | "static";
}

export interface ShippingQuoteRequest {
  toAddress: ShipToAddress;
  itemWeightsGrams: number[];
  zones: ShippingZoneTable[];
}

function hasCompleteAddress(address: ShipToAddress): boolean {
  return Boolean(address.line1 && address.city && address.state && address.postalCode);
}

export async function getShippingQuote(req: ShippingQuoteRequest): Promise<ShippingQuote> {
  const { toAddress, itemWeightsGrams, zones } = req;

  if (isEasyPostConfigured() && hasCompleteAddress(toAddress)) {
    try {
      const liveRate = await getEasyPostRate(toAddress, itemWeightsGrams);
      if (liveRate) {
        return { ...liveRate, source: "easypost" };
      }
    } catch (err) {
      // Never let a carrier-API failure block checkout — log and fall
      // through to the static estimate below.
      console.error("EasyPost rate lookup failed, falling back to static rate table:", err);
    }
  }

  const staticRate = calculateShippingCents(zones, toAddress.state, itemWeightsGrams);
  return { ...staticRate, source: "static" };
}
