"use client";

import { useWishlist } from "@/components/wishlist-provider";
import type { WishlistItem } from "@/lib/wishlist";

/**
 * Heart toggle for saving a product.
 *
 * Two presentations: `icon` (a floating heart used on product cards) and
 * the default labelled button used on the product detail page. Before
 * hydration it renders in the unsaved state — the saved flag lives in
 * localStorage, which the server cannot know.
 */
export function SaveButton({
  product,
  variant = "labelled",
}: {
  product: WishlistItem;
  variant?: "labelled" | "icon";
}) {
  const { saved, toggle, hydrated } = useWishlist();
  const isSaved = hydrated && saved(product.slug);

  const heart = (
    <svg
      width={variant === "icon" ? 18 : 16}
      height={variant === "icon" ? 18 : 16}
      viewBox="0 0 24 24"
      fill={isSaved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path
        d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9z"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => {
          // The card is wrapped in a link — don't navigate when saving.
          e.preventDefault();
          e.stopPropagation();
          toggle(product);
        }}
        aria-pressed={isSaved}
        aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
        title={isSaved ? "Saved" : "Save for later"}
        className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 backdrop-blur transition hover:bg-ivory focus-visible:outline-2 focus-visible:outline-burgundy ${
          isSaved ? "text-burgundy" : "text-charcoal/60"
        }`}
      >
        {heart}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(product)}
      aria-pressed={isSaved}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-burgundy ${
        isSaved
          ? "border-burgundy bg-burgundy/5 text-burgundy"
          : "border-charcoal/20 hover:border-burgundy hover:text-burgundy"
      }`}
    >
      {heart}
      {isSaved ? "Saved" : "Save for later"}
    </button>
  );
}
