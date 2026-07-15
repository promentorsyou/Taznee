import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

/**
 * Stripe webhook handler. In production this is the source of truth for
 * payment confirmation. For local/demo use, the confirmation page also
 * reconciles payment status directly so the flow works without a
 * publicly reachable webhook URL — see README.
 *
 * The signature is ALWAYS verified — there is no unauthenticated fallback.
 * An unverified path here would let anyone POST a fake
 * payment_intent.succeeded event and mark an arbitrary order as paid
 * without ever paying.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured; rejecting webhook request.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature error: ${err}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.orderId;
    if (orderId) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: "SUCCEEDED" },
      });
      await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });
    }
  }

  return NextResponse.json({ received: true });
}
