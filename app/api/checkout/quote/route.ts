import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateShippingCents, ShippingError } from "@/lib/shipping";
import { SHIPPING_ZONES } from "@/lib/shipping-data";
import { lineTotalCents, sumCents } from "@/lib/money";
import { calculateDeliveryEstimate, mergeDeliveryEstimates } from "@/lib/delivery";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const state: string = body.state;
  if (!state) return NextResponse.json({ error: "state is required" }, { status: 400 });

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    const itemWeights = cart.items.flatMap((i) => Array(i.quantity).fill(i.variant.product.weightGrams));
    const shipping = calculateShippingCents(SHIPPING_ZONES, state, itemWeights);

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
