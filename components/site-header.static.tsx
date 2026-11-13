/**
 * Static-export-only header, swapped in for site-header.tsx by
 * scripts/build-static.sh. No auth()/server actions — this build has no
 * server runtime, so there's nowhere to sign in.
 * MobileNav is a plain client component (no server dependencies), so the
 * static preview gets the same mobile menu as the live site.
 */
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { CartButton } from "@/components/cart-button";
import { SavedLink } from "@/components/saved-link";
import { SearchBox } from "@/components/search-box";
import { SearchLink } from "@/components/search-link";
import { NAV_LINKS } from "@/lib/nav-links";

export default function SiteHeader() {
  return (
    <header className="border-b border-charcoal/10 bg-ivory/95 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-2">
        <div className="flex shrink-0 items-center gap-1">
          <MobileNav />
          <Link href="/" className="font-serif text-2xl tracking-wide text-burgundy py-2">
            Taznee
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm whitespace-nowrap">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="py-2 hover:text-burgundy">
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Search runs in the browser here (see app/search/page.static.tsx). */}
        <div className="hidden lg:block flex-1 max-w-[16rem] mx-2">
          <SearchBox compact />
        </div>
        {/* The cart is client-side (localStorage), so it works here too —
            only sign-in and server-side order placement need the live app. */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3 text-sm">
          <SearchLink />
          <SavedLink />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
