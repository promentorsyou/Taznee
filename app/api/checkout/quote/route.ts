import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ShippingError } from "@/lib/shipping";
import { getShippingQuote } from "@/lib/shipping-provider";
import { SHIPPING_ZONES } from "@/lib/shipping-data";
import { calculateDeliveryEstimate, mergeDeliveryEstimates } from "@/lib/delivery";
import { cartItemsSchema, priceCartLines, CartPricingError } from "@/lib/cart-pricing";

/**
 * Shipping/total quote for a client-submitted cart. Guest-capable (no
 * sign-in required) and, like create-order, re-prices every line against
 * the database rather than trusting the client.
 */
const quoteSchema = z.object({
  items: cartItemsSchema,
  fullName: z.string().trim().max(200).optional(),
  line1: z.string().trim().max(200).optional(),
  city: z.string().trim().max(120).optional(),
  state: z
    .string()
    .trim()
    .length(2)
    .regex(/^[A-Za-z]{2}$/, "state must be a 2-letter US state/territory code"),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/)
    .optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "state is required and must be a valid 2-letter code" }, { status: 400 });
  }
  const { items, fullName, line1, city, state, postalCode } = parsed.data;

  let priced;
  try {
    priced = await priceCartLines(items);
  } catch (err) {
    if (err instanceof CartPricingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  try {
    // Full address is used for a live carrier-rate lookup when available
    // (see lib/shipping-provider.ts); state alone is enough for the static
    // rate-table fallback, so this quote works even before the customer
    // has filled in the rest of the form.
    const shipping = await getShippingQuote({
      toAddress: {
        fullName: fullName || "Customer",
        line1: line1 || "",
        city: city || "",
        state,
        postalCode: postalCode || "",
      },
      itemWeightsGrams: priced.itemWeightsGrams,
      zones: SHIPPING_ZONES,
    });

    const subtotalCents = priced.subtotalCents;

    const estimates = priced.lines.map((l) =>
      calculateDeliveryEstimate({
        readyToShip: l.readyToShip,
        processingMinDays: l.processingMinDays,
        processingMaxDays: l.processingMaxDays,
        transitMinDays: shipping.transitMinDays,
        transitMaxDays: shipping.transitMaxDays,
      }),
    );
    const merged = mergeDeliveryEstimates(estimates);

    return NextResponse.json({
      subtotalCents,
      shippingCents: shipping.shippingCents,
      totalCents: subtotalCents + shipping.shippingCents,
      zoneName: shipping.zoneName,
      shippingSource: shipping.source,
      estimatedMinDate: merged.estimatedMinDate,
      estimatedMaxDate: merged.estimatedMaxDate,
      totalMinDays: merged.totalMinDays,
      totalMaxDays: merged.totalMaxDays,
    });
  } catch (err) {
    if (err instanceof ShippingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
