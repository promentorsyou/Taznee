import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="uppercase tracking-[0.2em] text-gold text-xs mb-4">404</p>
      <h1 className="font-serif text-3xl sm:text-4xl mb-4">We couldn&apos;t find that page</h1>
      <p className="text-charcoal/60 mb-8">
        The page you&apos;re looking for may have moved or no longer exists.
      </p>
      <Link
        href="/"
        className="inline-block bg-burgundy text-ivory px-6 py-3 rounded-md hover:bg-burgundy/90 transition"
      >
        Return home
      </Link>
    </div>
  );
}
