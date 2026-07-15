import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateShippingCents, ShippingError } from "@/lib/shipping";
import { SHIPPING_ZONES } from "@/lib/shipping-data";
import { lineTotalCents, sumCents } from "@/lib/money";
import { calculateDeliveryEstimate, mergeDeliveryEstimates } from "@/lib/delivery";
import { stripe } from "@/lib/stripe";

const addressSchema = z.object({
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
 * Creates a PENDING Order + a Stripe PaymentIntent for the current user's
 * cart, shipping to the provided address. Returns the PaymentIntent
 * client_secret for Stripe Elements to confirm on the client, plus the
 * orderId to redirect to after confirmation.
 */
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

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid address", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { fullName, line1, line2, city, state, postalCode, phone } = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  let shipping: ReturnType<typeof calculateShippingCents>;
  try {
    const itemWeights = cart.items.flatMap((i) => Array(i.quantity).fill(i.variant.product.weightGrams));
    shipping = calculateShippingCents(SHIPPING_ZONES, state, itemWeights);
  } catch (err) {
    if (err instanceof ShippingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const subtotalCents = sumCents(
    cart.items.map((i) => lineTotalCents(i.variant.priceCents ?? i.variant.product.basePriceCents, i.quantity)),
  );
  const totalCents = subtotalCents + shipping.shippingCents;

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

  // Address + Order + OrderItems are created atomically so a failure never
  // leaves an orphaned Address row with no corresponding Order.
  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId: session.user.id,
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
        userId: session.user.id,
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
          create: cart.items.map((i) => ({
            variantId: i.variantId,
            nameSnapshot: i.variant.product.name,
            sizeSnapshot: i.variant.size,
            colorSnapshot: i.variant.color,
            priceCentsSnapshot: i.variant.priceCents ?? i.variant.product.basePriceCents,
            shippingCentsSnapshot: Math.round(shipping.shippingCents / cart.items.length),
            quantity: i.quantity,
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
