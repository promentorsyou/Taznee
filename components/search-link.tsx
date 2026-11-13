import Link from "next/link";

/**
 * Magnifier icon linking to /search. Shown below `lg`, where the inline
 * header search field is hidden to keep the bar from crowding on phones
 * and tablets.
 */
export function SearchLink() {
  return (
    <Link
      href="/search"
      aria-label="Search products"
      className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-charcoal/5 active:bg-charcoal/10 lg:hidden"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
