"use client";

import Image from "next/image";
import Link from "next/link";
import { centsToDisplay, lineTotalCents } from "@/lib/money";
import { MAX_QUANTITY_PER_LINE, type CartItem } from "@/lib/cart";
import { useCart } from "@/components/cart-provider";

/**
 * Quantity stepper. Uses buttons rather than a bare number input so it is
 * comfortable on touch (44px targets) and can't be left in an invalid
 * intermediate state the way a free-text field can.
 */
function QuantityStepper({ item }: { item: CartItem }) {
  const { update } = useCart();
  const atMax = item.quantity >= MAX_QUANTITY_PER_LINE;

  return (
    <div className="inline-flex items-center rounded-md border border-charcoal/20">
      <button
        type="button"
        onClick={() => update(item.id, item.quantity - 1)}
        aria-label={`Decrease quantity of ${item.name}`}
        className="h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center text-charcoal/70 hover:text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy rounded-l-md"
      >
        <span aria-hidden="true">−</span>
      </button>
      <span className="min-w-9 text-center text-sm tabular-nums" aria-live="polite">
        {item.quantity}
      </span>
      <button
        type="button"
        onClick={() => update(item.id, item.quantity + 1)}
        disabled={atMax}
        aria-label={
          atMax
            ? `Maximum quantity reached for ${item.name}`
            : `Increase quantity of ${item.name}`
        }
        className="h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center text-charcoal/70 hover:text-burgundy disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-burgundy rounded-r-md"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}

export function CartLineItem({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const { remove } = useCart();

  return (
    <div className="flex gap-3 py-4">
      <Link
        href={`/product/${item.productSlug}`}
        className="relative shrink-0 overflow-hidden rounded-md bg-charcoal/5"
        style={{ width: compact ? 64 : 88, height: compact ? 85 : 117 }}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="88px"
            className="object-cover"
          />
        ) : (
          <span className="sr-only">{item.name}</span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${item.productSlug}`}
              className="font-medium text-sm hover:text-burgundy line-clamp-2"
            >
              {item.name}
            </Link>
            {(item.size || item.color) && (
              <p className="mt-0.5 text-xs text-charcoal/50">
                {[item.size, item.color].filter(Boolean).join(" / ")}
              </p>
            )}
            <p className="mt-0.5 text-xs text-charcoal/60">
              {centsToDisplay(item.unitPriceCents)} each
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium tabular-nums">
            {centsToDisplay(lineTotalCents(item.unitPriceCents, item.quantity))}
          </span>
        </div>

        {!item.available && (
          <p className="mt-2 rounded bg-burgundy/10 px-2 py-1 text-xs text-burgundy">
            This option is unavailable — remove it to continue.
          </p>
        )}

        <div className="mt-2 flex items-center gap-3">
          <QuantityStepper item={item} />
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="text-xs text-charcoal/50 underline-offset-2 hover:text-burgundy hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
