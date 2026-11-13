import Link from "next/link";
import { auth, signOut } from "@/auth";
import { MobileNav } from "@/components/mobile-nav";
import { CartButton } from "@/components/cart-button";
import { SavedLink } from "@/components/saved-link";
import { SearchBox } from "@/components/search-box";
import { SearchLink } from "@/components/search-link";
import { NAV_LINKS } from "@/lib/nav-links";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function SiteHeader() {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  // On phones the bar only has room for icons, so account links live in
  // the menu drawer; from `sm` up they sit in the bar.
  const accountLinks = user
    ? [
        { href: "/account/orders", label: "My Orders" },
        ...(isAdmin ? [{ href: "/admin/products", label: "Admin" }] : []),
      ]
    : [
        { href: "/login", label: "Sign in" },
        { href: "/register", label: "Create account" },
      ];

  return (
    <header className="border-b border-charcoal/10 bg-ivory/95 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-2">
        <div className="flex shrink-0 items-center gap-1">
          <MobileNav extraLinks={accountLinks}>
            {user && (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="block w-full rounded-md px-3 py-3 text-left text-base hover:bg-charcoal/5 active:bg-charcoal/10"
                >
                  Sign out
                </button>
              </form>
            )}
          </MobileNav>
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
        <div className="hidden lg:block flex-1 max-w-[16rem] mx-2">
          <SearchBox compact />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 text-sm whitespace-nowrap">
          <SearchLink />
          <SavedLink />
          <CartButton />
          {user ? (
            <>
              <Link href="/account/orders" className="hidden sm:inline px-1 py-2 hover:text-burgundy">
                My Orders
              </Link>
              {isAdmin && (
                <Link href="/admin/products" className="hidden sm:inline px-1 py-2 hover:text-burgundy">
                  Admin
                </Link>
              )}
              <form action={signOutAction} className="hidden sm:block">
                <button type="submit" className="px-1 py-2 hover:text-burgundy">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hidden sm:inline px-1 py-2 hover:text-burgundy">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
