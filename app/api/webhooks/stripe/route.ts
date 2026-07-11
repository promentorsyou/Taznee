import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

/**
 * Stripe webhook handler. In production this is the source of truth for
 * payment confirmation. For local/demo use, the confirmation page also
 * reconciles payment status directly so the flow works without a
 * publicly reachable webhook URL — see README.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (!secret || !signature) {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    }
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
