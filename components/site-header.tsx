import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function SiteHeader() {
  const session = await auth();

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
          <Link href="/cart" className="hover:text-burgundy">Cart</Link>
          {session?.user ? (
            <>
              <Link href="/account/orders" className="hover:text-burgundy">My Orders</Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin/products" className="hover:text-burgundy">Admin</Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="hover:text-burgundy">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-burgundy">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
