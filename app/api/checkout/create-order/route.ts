import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShippingError } from "@/lib/shipping";
import { getShippingQuote, type ShippingQuote } from "@/lib/shipping-provider";
import { SHIPPING_ZONES } from "@/lib/shipping-data";
import { calculateDeliveryEstimate, mergeDeliveryEstimates } from "@/lib/delivery";
import { cartItemsSchema, priceCartLines, CartPricingError } from "@/lib/cart-pricing";
import { PAYMENTS_ENABLED } from "@/lib/payments";
import { stripe } from "@/lib/stripe";

const addressSchema = z.object({
  email: z.string().trim().email().max(320),
  items: cartItemsSchema,
  fullName: z.string().trim().min(1).max(200),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(1).max(120),
  state: z
    .string()
    .trim()
    .length(2)
    .regex(/^[A-Za-z]{2}$/, "state must be a 2-letter US state/territory code"),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "postalCode must be a valid US ZIP code"),
  phone: z.string().trim().max(30).optional().nullable(),
});

/**
 * Creates a PENDING Order + a Stripe PaymentIntent for the submitted cart,
 * shipping to the provided address. Returns the PaymentIntent
 * client_secret for Stripe Elements to confirm on the client, plus the
 * orderId to redirect to after confirmation.
 *
 * Guest-capable: sign-in is optional. When there is a session the order is
 * attached to that user; otherwise it is identified by the submitted email.
 *
 * The cart is sent by the client (it lives in localStorage), so every line
 * is re-priced against the database in priceCartLines — client-supplied
 * prices are never trusted.
 */
export async function POST(req: NextRequest) {
  // Hard server-side gate. PAYMENTS_ENABLED also drives the checkout UI,
  // but this check means a hand-crafted request cannot create an order or
  // a PaymentIntent while payments are switched off.
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json(
      { error: "Checkout is not available yet. No order has been created." },
      { status: 503 },
    );
  }

  const session = await auth();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid address", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { email, items, fullName, line1, line2, city, state, postalCode, phone } = parsed.data;

  // Authoritative pricing from the database — see lib/cart-pricing.ts.
  let priced;
  try {
    priced = await priceCartLines(items);
  } catch (err) {
    if (err instanceof CartPricingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  let shipping: ShippingQuote;
  try {
    shipping = await getShippingQuote({
      toAddress: { fullName, line1, city, state, postalCode },
      itemWeightsGrams: priced.itemWeightsGrams,
      zones: SHIPPING_ZONES,
    });
  } catch (err) {
    if (err instanceof ShippingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const subtotalCents = priced.subtotalCents;
  const totalCents = subtotalCents + shipping.shippingCents;

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

  // Address + Order + OrderItems are created atomically so a failure never
  // leaves an orphaned Address row with no corresponding Order.
  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId: session?.user?.id ?? null,
        fullName,
        line1,
        line2: line2 || null,
        city,
        state: state.toUpperCase(),
        postalCode,
        country: "US",
        phone: phone || null,
      },
    });

    return tx.order.create({
      data: {
        userId: session?.user?.id ?? null,
        // Recorded for every order so guests can be contacted about it;
        // for signed-in customers it is the address they typed here.
        guestEmail: email,
        addressId: address.id,
        status: "PENDING",
        subtotalCents,
        shippingCents: shipping.shippingCents,
        totalCents,
        estimatedDeliveryMinDays: merged.totalMinDays,
        estimatedDeliveryMaxDays: merged.totalMaxDays,
        estimatedDeliveryMinDate: merged.estimatedMinDate,
        estimatedDeliveryMaxDate: merged.estimatedMaxDate,
        items: {
          create: priced.lines.map((l) => ({
            variantId: l.variantId,
            nameSnapshot: l.nameSnapshot,
            sizeSnapshot: l.sizeSnapshot,
            colorSnapshot: l.colorSnapshot,
            priceCentsSnapshot: l.unitPriceCents,
            shippingCentsSnapshot: Math.round(shipping.shippingCents / priced.lines.length),
            quantity: l.quantity,
          })),
        },
      },
    });
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalCents,
        currency: "usd",
        metadata: { orderId: order.id },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: `order-${order.id}` },
    );

    await prisma.payment.create({
      data: {
        orderId: order.id,
        stripePaymentIntentId: paymentIntent.id,
        amountCents: totalCents,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    // The Order already exists (status PENDING, no Payment) — the customer
    // can retry from the confirmation/cart flow without double-ordering,
    // since a fresh checkout attempt reuses the cart and creates a new order.
    console.error(`Failed to create PaymentIntent for order ${order.id}:`, err);
    return NextResponse.json(
      { error: "Payment could not be initialized. Please try again." },
      { status: 502 },
    );
  }
}
