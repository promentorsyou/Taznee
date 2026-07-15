import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { centsToDisplay } from "@/lib/money";
import { formatDateRange } from "@/lib/delivery";
import { stripe } from "@/lib/stripe";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, address: true, payment: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  // Reconcile payment status directly with Stripe for the demo flow
  // (a real deployment relies on the /api/webhooks/stripe handler instead).
  if (order.payment?.stripePaymentIntentId && order.status === "PENDING") {
    try {
      const intent = await stripe.paymentIntents.retrieve(order.payment.stripePaymentIntentId);
      if (intent.status === "succeeded") {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: { status: "SUCCEEDED" },
        });
        await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
        await prisma.cartItem.deleteMany({ where: { cart: { userId: session.user.id } } });
        order.status = "PAID";
      }
    } catch {
      // Stripe not configured (no real key) — leave status as-is for the demo.
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="font-serif text-3xl mb-2">
        {order.status === "PAID" ? "Thank you for your order!" : "Order received"}
      </h1>
      <p className="text-charcoal/60 mb-8">Order #{order.id.slice(-8).toUpperCase()}</p>

      <div className="text-left border border-charcoal/10 rounded-md p-6 space-y-4">
        <div>
          <h2 className="font-medium mb-2">Items</h2>
          <ul className="text-sm space-y-1">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.nameSnapshot} ({item.sizeSnapshot}/{item.colorSnapshot}) x{item.quantity}
                </span>
                <span>{centsToDisplay(item.priceCentsSnapshot * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-charcoal/10 pt-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>{centsToDisplay(order.subtotalCents)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{centsToDisplay(order.shippingCents)}</span></div>
          <div className="flex justify-between font-medium"><span>Total</span><span>{centsToDisplay(order.totalCents)}</span></div>
        </div>
        <div className="border-t border-charcoal/10 pt-3 text-sm">
          <p className="font-medium mb-1">Shipping to</p>
          <p className="text-charcoal/70">
            {order.address.fullName}<br />
            {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
            {order.address.city}, {order.address.state} {order.address.postalCode}
          </p>
        </div>
        <div className="border-t border-forest/20 pt-3 text-forest text-sm">
          Estimated delivery: {formatDateRange(order.estimatedDeliveryMinDate, order.estimatedDeliveryMaxDate)}
        </div>
      </div>

      <Link href="/account/orders" className="inline-block mt-8 text-burgundy hover:underline">
        View my orders
      </Link>
    </div>
  );
}
