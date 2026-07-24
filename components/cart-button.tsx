"use client";

import { useCart } from "@/components/cart-provider";

/**
 * Header bag button with a live item-count badge. Opens the mini-cart
 * drawer rather than navigating, so the customer keeps their place.
 *
 * Client component backed by the localStorage cart, so it works in both the
 * live app and the static export. The badge renders only after hydration —
 * before that the server HTML has no count, and rendering one would cause a
 * hydration mismatch.
 */
export function CartButton() {
  const { count, hydrated, openDrawer } = useCart();
  const showCount = hydrated && count > 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={showCount ? `Open bag, ${count} item${count === 1 ? "" : "s"}` : "Open bag (empty)"}
      className="relative flex items-center px-1 py-2 hover:text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy rounded"
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
      {showCount && (
        <span className="absolute -top-0.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-medium text-ivory">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
