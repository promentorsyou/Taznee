"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { centsToDisplay } from "@/lib/money";
import { useCart } from "@/components/cart-provider";
import { CartLineItem } from "@/components/cart-line-item";

/**
 * Mini-cart drawer. Opens automatically after an add so the customer gets
 * immediate, unambiguous confirmation without losing their place on the
 * product page (a full redirect to /cart is a known drop-off point).
 *
 * Rendered once in the root layout. Escape closes it, the backdrop closes
 * it, and focus moves to the close button while open.
 */
export function CartDrawer() {
  const { items, count, subtotal, hasUnavailable, drawerOpen, closeDrawer } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    // Prevent the page behind the drawer from scrolling on touch devices.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-charcoal/50"
      onClick={closeDrawer}
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-sm flex-col bg-ivory shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
          <h2 id="cart-drawer-title" className="font-serif text-xl">
            Your bag{count > 0 ? ` (${count})` : ""}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close bag"
            className="rounded-full p-2 text-charcoal/60 hover:bg-charcoal/10 hover:text-charcoal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-charcoal/60">Your bag is empty.</p>
            <Link
              href="/category/sarees"
              onClick={closeDrawer}
              className="rounded-md bg-burgundy px-5 py-2.5 text-sm text-ivory hover:bg-burgundy/90"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-charcoal/10 overflow-y-auto px-5">
              {items.map((item) => (
                <CartLineItem key={item.id} item={item} compact />
              ))}
            </div>

            <footer className="border-t border-charcoal/10 px-5 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">Subtotal</span>
                <span className="font-medium tabular-nums">{centsToDisplay(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-charcoal/50">
                Shipping and any taxes are calculated at checkout.
              </p>
              {hasUnavailable && (
                <p className="mt-2 text-xs text-burgundy">
                  Remove unavailable items before checking out.
                </p>
              )}
              <div className="mt-4 grid gap-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block rounded-md bg-burgundy px-5 py-3 text-center text-ivory hover:bg-burgundy/90"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="block rounded-md border border-charcoal/20 px-5 py-3 text-center text-sm hover:border-burgundy hover:text-burgundy"
                >
                  View bag
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
