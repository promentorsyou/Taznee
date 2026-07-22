import Link from "next/link";
import { auth, signOut } from "@/auth";
import { MobileNav } from "@/components/mobile-nav";
import { CartLink } from "@/components/cart-link";
import { SearchBox } from "@/components/search-box";
import { NAV_LINKS } from "@/lib/nav-links";

async function AccountLinks() {
  const session = await auth();

  return (
    <>
      <CartLink />
      {session?.user ? (
        <>
          <Link href="/account/orders" className="hidden sm:inline px-1 py-2 hover:text-burgundy">My Orders</Link>
          {session.user.role === "ADMIN" && (
            <Link href="/admin/products" className="hidden sm:inline px-1 py-2 hover:text-burgundy">Admin</Link>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="px-1 py-2 hover:text-burgundy">Sign out</button>
          </form>
        </>
      ) : (
        <Link href="/login" className="px-1 py-2 hover:text-burgundy">Sign in</Link>
      )}
    </>
  );
}

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
        <div className="hidden sm:block flex-1 max-w-[16rem] mx-2">
          <SearchBox compact />
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <AccountLinks />
        </div>
      </div>
    </header>
  );
}
