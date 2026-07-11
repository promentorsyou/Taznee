import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateShippingCents } from "@/lib/shipping";
import { SHIPPING_ZONES } from "@/lib/shipping-data";
import { lineTotalCents, sumCents } from "@/lib/money";
import { calculateDeliveryEstimate, mergeDeliveryEstimates } from "@/lib/delivery";
import { stripe } from "@/lib/stripe";

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

  const body = await req.json();
  const { fullName, line1, line2, city, state, postalCode, phone } = body;

  if (!fullName || !line1 || !city || !state || !postalCode) {
    return NextResponse.json({ error: "Missing address fields" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      fullName,
      line1,
      line2: line2 || null,
      city,
      state,
      postalCode,
      country: "US",
      phone: phone || null,
    },
  });

  const itemWeights = cart.items.flatMap((i) => Array(i.quantity).fill(i.variant.product.weightGrams));
  const shipping = calculateShippingCents(SHIPPING_ZONES, state, itemWeights);
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

  const order = await prisma.order.create({
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

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: "usd",
    metadata: { orderId: order.id },
    automatic_payment_methods: { enabled: true },
  });

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
}
