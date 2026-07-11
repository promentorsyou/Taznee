import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/checkout-client";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/checkout");

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) redirect("/cart");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl mb-8">Checkout</h1>
      <CheckoutClient
        publishableKey={process.env.STRIPE_PUBLISHABLE_KEY ?? ""}
        items={cart.items.map((i) => ({
          id: i.id,
          name: i.variant.product.name,
          size: i.variant.size,
          color: i.variant.color,
          quantity: i.quantity,
          unitPriceCents: i.variant.priceCents ?? i.variant.product.basePriceCents,
        }))}
      />
    </div>
  );
}
