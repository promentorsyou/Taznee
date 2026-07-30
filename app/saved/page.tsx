import type { Metadata } from "next";
import { SavedPageClient } from "@/components/saved-page-client";
import { getCartRecommendations } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Saved Items",
  description: "Pieces you've saved to come back to.",
  alternates: { canonical: absoluteUrl("/saved") },
  // Personal, per-device page — nothing to index.
  robots: { index: false, follow: true },
};

export default async function SavedPage() {
  const recommendations = await getCartRecommendations();
  return <SavedPageClient recommendations={recommendations} />;
}
