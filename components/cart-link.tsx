import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Header cart link: a shopping-bag icon with a live item-count badge for the
 * signed-in user. Server component — the count is read per request, so it
 * reflects the latest cart after add/update/remove (those actions
 * revalidate and the layout re-renders on navigation). Live app only; the
 * static export header does not render this (no cart there).
 */
export async function CartLink() {
  const session = await auth();
  let count = 0;
  if (session?.user?.id) {
    const agg = await prisma.cartItem.aggregate({
      _sum: { quantity: true },
      where: { cart: { userId: session.user.id } },
    });
    count = agg._sum.quantity ?? 0;
  }

  const label = count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart (empty)";

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="relative flex items-center px-1 py-2 hover:text-burgundy"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M4 7h16l-1 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L4 7z" strokeLinejoin="round" />
        <path d="M9 7V6a3 3 0 0 1 6 0v1" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-burgundy text-ivory text-[10px] font-medium flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
