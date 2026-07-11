/**
 * Static-export-only header, swapped in for site-header.tsx by
 * scripts/build-static.sh. No auth()/server actions — this build has no
 * server runtime, so there's nowhere to sign in and no cart to view.
 */
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-charcoal/10 bg-ivory/95 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="font-serif text-2xl tracking-wide text-burgundy">
          Taznee
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/category/sarees" className="hover:text-burgundy">Sarees</Link>
          <Link href="/category/salwar-kameez" className="hover:text-burgundy">Salwar Kameez</Link>
          <Link href="/category/panjabi" className="hover:text-burgundy">Panjabi</Link>
          <Link href="/category/wedding" className="hover:text-burgundy">Wedding</Link>
          <Link href="/category/jewelry" className="hover:text-burgundy">Jewelry</Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-charcoal/40 text-xs uppercase tracking-wide">Static Preview</span>
        </div>
      </div>
    </header>
  );
}
