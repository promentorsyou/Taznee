"use client";

import { useMemo, useState } from "react";
import { addToCartAction } from "@/app/actions/cart";

interface VariantOption {
  id: string;
  size: string;
  color: string;
  inStock: boolean;
}

export function AddToCartForm({
  productId,
  productSlug,
  variants,
  sizes,
  colors,
}: {
  productId: string;
  productSlug: string;
  variants: VariantOption[];
  sizes: string[];
  colors: string[];
}) {
  const [size, setSize] = useState(sizes[0] ?? "");
  const [color, setColor] = useState(colors[0] ?? "");

  const selectedVariant = useMemo(
    () => variants.find((v) => v.size === size && v.color === color),
    [variants, size, color],
  );

  return (
    <form action={addToCartAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="variantId" value={selectedVariant?.id ?? ""} />

      {sizes.length > 0 && (
        <div>
          <label className="block text-sm text-charcoal/60 mb-1">Size</label>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2.5 rounded border text-sm min-w-11 ${
                  size === s ? "border-burgundy text-burgundy" : "border-charcoal/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <label className="block text-sm text-charcoal/60 mb-1">Color</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`px-4 py-2.5 rounded border text-sm min-w-11 ${
                  color === c ? "border-burgundy text-burgundy" : "border-charcoal/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-charcoal/60 mb-1">Quantity</label>
        <input
          type="number"
          name="quantity"
          defaultValue={1}
          min={1}
          className="border border-charcoal/20 rounded px-3 py-2.5 w-20 text-base"
          inputMode="numeric"
        />
      </div>

      <button
        type="submit"
        disabled={!selectedVariant || !selectedVariant.inStock}
        className="w-full bg-burgundy text-ivory py-3 rounded-md hover:bg-burgundy/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {selectedVariant && !selectedVariant.inStock ? "Out of Stock" : "Add to Cart"}
      </button>
      <p className="text-xs text-charcoal/40">Sign-in required to keep your cart saved to your account.</p>
    </form>
  );
}
