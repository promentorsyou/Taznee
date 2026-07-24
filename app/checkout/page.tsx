import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout-flow";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Taznee order.",
  alternates: { canonical: absoluteUrl("/checkout") },
  robots: { index: false, follow: false },
};

/**
 * Checkout entry point. The flow itself is a client component driven by the
 * localStorage cart, so it works for guests with no account and no server
 * round-trip. Whether a payment can actually be taken is decided by
 * PAYMENTS_ENABLED inside the flow.
 */
export default function CheckoutPage() {
  return <CheckoutFlow />;
}
