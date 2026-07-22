"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Product search input. Submits to the /search page (a live-app,
 * server-rendered route) — no client-side index, so results always match
 * the real catalog. Two layouts: the default page form and a `compact`
 * variant for the header.
 */
export function SearchBox({
  initialQuery = "",
  compact = false,
  autoFocus = false,
}: {
  initialQuery?: string;
  compact?: boolean;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full">
      <label htmlFor={compact ? "header-search" : "search-input"} className="sr-only">
        Search products
      </label>
      <input
        id={compact ? "header-search" : "search-input"}
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search sarees, panjabi, wedding…"
        className={
          compact
            ? "w-full rounded-full border border-charcoal/15 bg-ivory pl-9 pr-3 py-1.5 text-sm focus:border-burgundy focus:outline-none"
            : "w-full rounded-md border border-charcoal/20 pl-10 pr-3 py-2.5 focus:border-burgundy focus:outline-none"
        }
      />
      <span className={`pointer-events-none absolute inset-y-0 flex items-center ${compact ? "left-3" : "left-3"}`}>
        <svg
          width={compact ? 15 : 18}
          height={compact ? 15 : 18}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-charcoal/40"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    </form>
  );
}
