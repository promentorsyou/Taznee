"use client";

import { useMemo, useState } from "react";
import { DEFAULT_ITEM_WEIGHT_GRAMS, MAX_QUANTITY_PER_LINE, cartLineId } from "@/lib/cart";
import { centsToDisplay } from "@/lib/money";
import { useCart } from "@/components/cart-provider";

/**
 * Variant picker + quantity + Add to Cart.
 *
 * Guest-first: no sign-in is required. The selection is written to the
 * localStorage cart and the mini-cart drawer opens as confirmation.
 *
 * Size/colour combinations that don't exist as a variant are disabled
 * rather than hidden, so the customer can see the full range and
 * understand why something isn't selectable.
 */
interface VariantOption {
  id: string;
  size: string;
  color: string;
  inStock: boolean;
}

export function AddToCartForm({
  productSlug,
  productName,
  basePriceCents,
  imageUrl,
  variants,
  sizes,
  colors,
  weightGrams = DEFAULT_ITEM_WEIGHT_GRAMS,
}: {
  productSlug: string;
  productName: string;
  basePriceCents: number;
  imageUrl: string | null;
  variants: VariantOption[];
  sizes: string[];
  colors: string[];
  weightGrams?: number;
}) {
  const { add } = useCart();
  const [size, setSize] = useState(sizes[0] ?? "");
  const [color, setColor] = useState(colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.size === size && v.color === color),
    [variants, size, color],
  );

  /** Colours that pair with the chosen size (for disabling impossible combos). */
  const colorsForSize = useMemo(
    () => new Set(variants.filter((v) => v.size === size).map((v) => v.color)),
    [variants, size],
  );

  const unavailable = !selectedVariant || !selectedVariant.inStock;

  function handleAdd() {
    if (unavailable || !selectedVariant) return;
    add({
      id: cartLineId({ variantId: selectedVariant.id, productSlug, size, color }),
      productSlug,
      name: productName,
      size,
      color,
      unitPriceCents: basePriceCents,
      quantity,
      imageUrl,
      available: true,
      weightGrams,
    });
  }

  return (
    <div className="space-y-5">
      {sizes.length > 0 && (
        <fieldset>
          <legend className="mb-2 block text-sm text-charcoal/60">
            Size{size ? `: ${size}` : ""}
          </legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`min-h-11 min-w-11 rounded border px-4 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-burgundy ${
                  size === s
                    ? "border-burgundy bg-burgundy/5 text-burgundy"
                    : "border-charcoal/20 hover:border-charcoal/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-2 block text-sm text-charcoal/60">
            Color{color ? `: ${color}` : ""}
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const pairable = colorsForSize.has(c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  disabled={!pairable}
                  aria-pressed={color === c}
                  title={pairable ? undefined : `Not available in size ${size}`}
                  className={`min-h-11 min-w-11 rounded border px-4 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-35 ${
                    color === c
                      ? "border-burgundy bg-burgundy/5 text-burgundy"
                      : "border-charcoal/20 hover:border-charcoal/40"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="qty" className="mb-2 block text-sm text-charcoal/60">
          Quantity
        </label>
        <div className="inline-flex items-center rounded-md border border-charcoal/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center rounded-l-md text-charcoal/70 hover:text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy"
          >
            <span aria-hidden="true">−</span>
          </button>
          <output id="qty" className="min-w-10 text-center text-sm tabular-nums">
            {quantity}
          </output>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY_PER_LINE, q + 1))}
            disabled={quantity >= MAX_QUANTITY_PER_LINE}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center rounded-r-md text-charcoal/70 hover:text-burgundy disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-burgundy"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={unavailable}
        className="w-full rounded-md bg-burgundy py-3.5 text-ivory transition hover:bg-burgundy/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
      >
        {unavailable
          ? "Unavailable in this combination"
          : `Add to Bag — ${centsToDisplay(basePriceCents * quantity)}`}
      </button>

      <p className="text-xs text-charcoal/45">
        No account needed — your bag is saved on this device.
      </p>
    </div>
  );
}
