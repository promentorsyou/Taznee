import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart-page-client";
import { getCartRecommendations } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your Bag",
  description: "Review the items in your Taznee bag before checkout.",
  alternates: { canonical: absoluteUrl("/cart") },
  // A personal, per-device page — never something to index.
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  // Recommendations are fetched on the server (DB in the live app, the
  // in-memory fixture in the static export) and passed down, so the client
  // cart component stays free of any data-layer dependency.
  const recommendations = await getCartRecommendations();
  return <CartPageClient recommendations={recommendations} />;
}
