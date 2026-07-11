import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { centsToDisplay } from "@/lib/money";
import { formatDateRange } from "@/lib/delivery";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function OrderHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-charcoal/60 mb-4">You have not placed any orders yet.</p>
          <Link href="/" className="text-burgundy hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-charcoal/10 rounded-md p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-charcoal/50">
                    Placed {order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span className="text-sm bg-forest/10 text-forest px-3 py-1 rounded-full">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <ul className="text-sm space-y-1 mb-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-charcoal/70">
                    <span>{item.nameSnapshot} ({item.sizeSnapshot}/{item.colorSnapshot}) x{item.quantity}</span>
                    <span>{centsToDisplay(item.priceCentsSnapshot * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-sm border-t border-charcoal/10 pt-2">
                <span className="text-forest">
                  Est. delivery: {formatDateRange(order.estimatedDeliveryMinDate, order.estimatedDeliveryMaxDate)}
                </span>
                <span className="font-medium">{centsToDisplay(order.totalCents)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
