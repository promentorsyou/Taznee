import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShippingError } from "@/lib/shipping";
import { getShippingQuote } from "@/lib/shipping-provider";
import { SHIPPING_ZONES } from "@/lib/shipping-data";
import { lineTotalCents, sumCents } from "@/lib/money";
import { calculateDeliveryEstimate, mergeDeliveryEstimates } from "@/lib/delivery";

const quoteSchema = z.object({
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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
  const { fullName, line1, city, state, postalCode } = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    const itemWeights = cart.items.flatMap((i) => Array(i.quantity).fill(i.variant.product.weightGrams));

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
      itemWeightsGrams: itemWeights,
      zones: SHIPPING_ZONES,
    });

    const subtotalCents = sumCents(
      cart.items.map((i) => lineTotalCents(i.variant.priceCents ?? i.variant.product.basePriceCents, i.quantity)),
    );

    const estimates = cart.items.map((i) =>
      calculateDeliveryEstimate({
        readyToShip: i.variant.product.readyToShip,
        processingMinDays: i.variant.product.processingMinDays,
        processingMaxDays: i.variant.product.processingMaxDays,
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
