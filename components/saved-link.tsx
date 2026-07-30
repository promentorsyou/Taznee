"use client";

import Link from "next/link";
import { useWishlist } from "@/components/wishlist-provider";

/**
 * Header link to saved items, with a count badge. The badge renders only
 * after hydration — the count lives in localStorage, so showing it during
 * the server render would cause a mismatch.
 */
export function SavedLink() {
  const { count, hydrated } = useWishlist();
  const showCount = hydrated && count > 0;

  return (
    <Link
      href="/saved"
      aria-label={showCount ? `Saved items, ${count} saved` : "Saved items"}
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
        <path
          d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9z"
          strokeLinejoin="round"
        />
      </svg>
      {showCount && (
        <span className="absolute -right-1.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-medium text-ivory">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
