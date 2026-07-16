import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { centsToDisplay, lineTotalCents, sumCents } from "@/lib/money";
import { updateCartItemAction, removeCartItemAction } from "@/app/actions/cart";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/cart");

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          variant: { include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } } },
        },
      },
    },
  });

  const items = cart?.items ?? [];
  const subtotalCents = sumCents(
    items.map((i) => lineTotalCents(i.variant.priceCents ?? i.variant.product.basePriceCents, i.quantity)),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-charcoal/60 mb-4">Your cart is empty.</p>
          <Link href="/" className="text-burgundy hover:underline">Continue shopping</Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-charcoal/10">
            {items.map((item) => {
              const unitPrice = item.variant.priceCents ?? item.variant.product.basePriceCents;
              return (
                <div key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
                  <div className="min-w-0 flex-1 basis-52">
                    <p className="font-medium">{item.variant.product.name}</p>
                    <p className="text-sm text-charcoal/50">
                      {item.variant.size} / {item.variant.color}
                    </p>
                    <p className="text-sm">{centsToDisplay(unitPrice)}</p>
                  </div>
                  <form action={updateCartItemAction} className="flex items-center gap-2">
                    <input type="hidden" name="itemId" value={item.id} />
                    <label>
                      <span className="sr-only">Quantity for {item.variant.product.name}</span>
                      <input
                        type="number"
                        name="quantity"
                        defaultValue={item.quantity}
                        min={0}
                        inputMode="numeric"
                        className="w-16 border border-charcoal/20 rounded px-2 py-2 text-base"
                      />
                    </label>
                    <button type="submit" className="px-2 py-2 text-sm text-charcoal/60 hover:text-burgundy">
                      Update
                    </button>
                  </form>
                  <form action={removeCartItemAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button type="submit" className="px-2 py-2 text-sm text-burgundy hover:underline">
                      Remove
                    </button>
                  </form>
                  <div className="w-24 text-right font-medium ml-auto">
                    {centsToDisplay(lineTotalCents(unitPrice, item.quantity))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full sm:w-72 space-y-2">
              <div className="flex justify-between text-charcoal/70">
                <span>Subtotal</span>
                <span>{centsToDisplay(subtotalCents)}</span>
              </div>
              <p className="text-xs text-charcoal/40">Shipping calculated at checkout.</p>
              <Link
                href="/checkout"
                className="block text-center bg-burgundy text-ivory py-3 rounded-md hover:bg-burgundy/90 transition mt-4"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
