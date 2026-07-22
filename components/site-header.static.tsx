/**
 * Static-export-only header, swapped in for site-header.tsx by
 * scripts/build-static.sh. No auth()/server actions — this build has no
 * server runtime, so there's nowhere to sign in and no cart to view.
 * MobileNav is a plain client component (no server dependencies), so the
 * static preview gets the same mobile menu as the live site.
 */
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { NAV_LINKS } from "@/lib/nav-links";

export default function SiteHeader() {
  return (
    <header className="border-b border-charcoal/10 bg-ivory/95 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-2">
        <div className="flex items-center gap-1">
          <MobileNav />
          <Link href="/" className="font-serif text-2xl tracking-wide text-burgundy py-2">
            Taznee
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="py-2 hover:text-burgundy">
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Search needs a server query per request, which the database-free
            static export can't run — show a disabled field so the preview
            still communicates that search exists in the live app. */}
        <div className="hidden sm:block flex-1 max-w-[16rem] mx-2">
          <div className="relative" title="Search is available in the live app">
            <input
              type="search"
              disabled
              placeholder="Search (live app only)"
              aria-label="Search products (available in the live app only)"
              className="w-full rounded-full border border-charcoal/15 bg-charcoal/5 pl-9 pr-3 py-1.5 text-sm text-charcoal/40 cursor-not-allowed"
            />
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-charcoal/30">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-charcoal/40 text-xs uppercase tracking-wide">Static Preview</span>
        </div>
      </div>
    </header>
  );
}
