"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="uppercase tracking-[0.2em] text-gold text-xs mb-4">Error</p>
      <h1 className="font-serif text-3xl sm:text-4xl mb-4">Something went wrong</h1>
      <p className="text-charcoal/60 mb-8">
        We hit an unexpected error loading this page. You can try again, or head back to the
        homepage.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={reset}
          className="bg-burgundy text-ivory px-6 py-3 rounded-md hover:bg-burgundy/90 transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-charcoal/20 px-6 py-3 rounded-md hover:bg-charcoal/5 transition"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
