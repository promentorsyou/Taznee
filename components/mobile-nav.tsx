"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav-links";

/**
 * Hamburger menu for small screens. The desktop nav hides below `lg`, so
 * without this, mobile users had no way to browse categories at all.
 */
export function MobileNav({
  extraLinks = [],
  children,
}: {
  /** Account links (sign in, orders…) that don't fit in the bar on phones. */
  extraLinks?: { href: string; label: string }[];
  /** Extra server-rendered content for the bottom of the drawer (e.g. sign-out form). */
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation (state-adjustment-during-render pattern,
  // per https://react.dev/learn/you-might-not-need-an-effect).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-charcoal/5 active:bg-charcoal/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-charcoal/10 bg-ivory shadow-lg"
        >
          <nav className="mx-auto max-w-7xl px-4 py-2" aria-label="Categories">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-3 text-base hover:bg-charcoal/5 active:bg-charcoal/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {(extraLinks.length > 0 || children) && (
            <div className="mx-auto max-w-7xl border-t border-charcoal/10 px-4 py-2 sm:hidden">
              {extraLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-md px-3 py-3 text-base hover:bg-charcoal/5 active:bg-charcoal/10"
                >
                  {link.label}
                </Link>
              ))}
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
