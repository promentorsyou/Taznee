import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { STATIC_EXPORT } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Taznee's returns and refunds policy for orders shipped from Bangladesh to the United States — return window, eligibility, who pays return shipping, and how refunds are processed.",
  alternates: { canonical: absoluteUrl("/returns") },
};

// Business rules, kept as constants so they can later be surfaced in the
// admin/CMS and reused by the (deferred) ReturnRequest workflow without
// the numbers drifting out of sync with this page.
const RETURN_WINDOW_DAYS = 14;
const REFUND_PROCESSING_DAYS = "5–7 business days";
const RETURNS_EMAIL = "care@taznee.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl mb-3">{title}</h2>
      <div className="space-y-3 text-charcoal/80 leading-relaxed">{children}</div>
    </section>
  );
}

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl mb-3">Returns &amp; Refunds</h1>
      <p className="text-charcoal/60">
        We want you to love what you ordered. If something isn&apos;t right, here&apos;s exactly how
        returns and refunds work at Taznee.
      </p>

      <Section title={`Return window: ${RETURN_WINDOW_DAYS} days`}>
        <p>
          You can request a return within <strong>{RETURN_WINDOW_DAYS} days of delivery</strong>.
          Because every Taznee order travels internationally from Bangladesh, the return window is
          measured from the date your order is marked <em>Delivered</em>, not the date it shipped.
        </p>
      </Section>

      <Section title="Condition of returned items">
        <p>To be eligible for a return, an item must be:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Unworn, unwashed, and unaltered, with no signs of use.</li>
          <li>In its original condition with all tags and packaging intact.</li>
          <li>Free of stains, fragrance, deodorant marks, or other damage.</li>
        </ul>
        <p>
          Returns that arrive in a used or altered condition may be declined and sent back to you.
        </p>
      </Section>

      <Section title="Who pays for return shipping">
        <p>
          <strong>If the return is our fault</strong> — the item arrived damaged, defective, or is
          not what you ordered — Taznee covers the return shipping and refunds you in full,
          including the original shipping charge.
        </p>
        <p>
          <strong>For any other reason</strong> — for example a change of mind, fit, or preference —
          the return shipping cost is the customer&apos;s responsibility, and the original shipping
          charge is non-refundable. Where a return shipping cost is deducted from a refund, we will
          tell you the amount before you send the item back.
        </p>
      </Section>

      <Section title="Items that can't be returned">
        <p>Some items are final sale and cannot be returned or exchanged:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Made-to-order and custom-stitched pieces.</strong> These are produced
            specifically for you after you order, so they can&apos;t be resold. Product pages label
            these clearly and show a longer dispatch estimate; ready-to-ship items are returnable
            under this policy.
          </li>
          <li>Pierced jewelry such as earrings and nose pins, for hygiene reasons.</li>
          <li>Items marked <strong>Final Sale</strong> or bought during clearance.</li>
          <li>Gift cards and store credit.</li>
        </ul>
      </Section>

      <Section title="How to start a return">
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            Email us at{" "}
            <a href={`mailto:${RETURNS_EMAIL}`} className="text-burgundy hover:underline">
              {RETURNS_EMAIL}
            </a>{" "}
            with your order number and the item(s) you&apos;d like to return, within{" "}
            {RETURN_WINDOW_DAYS} days of delivery.
          </li>
          <li>
            We&apos;ll confirm your eligibility and send return instructions, including the address
            to ship to and — if applicable — any return shipping cost.
          </li>
          <li>Pack the item securely in its original packaging and ship it back to us.</li>
        </ol>
        <p className="text-sm text-charcoal/60">
          Please don&apos;t ship an item back before your return has been confirmed — unconfirmed
          returns can&apos;t be tracked or refunded.
        </p>
      </Section>

      <Section title="Refunds">
        <p>
          Once we receive and inspect your return, we&apos;ll email you to confirm it&apos;s
          approved. Approved refunds are issued to your original payment method within{" "}
          {REFUND_PROCESSING_DAYS} of approval. Depending on your bank or card issuer, it may take a
          few additional days for the refund to appear on your statement.
        </p>
      </Section>

      <Section title="Damaged or wrong items">
        <p>
          If your order arrives damaged or you received the wrong item, contact us at{" "}
          <a href={`mailto:${RETURNS_EMAIL}`} className="text-burgundy hover:underline">
            {RETURNS_EMAIL}
          </a>{" "}
          within 48 hours of delivery with a photo of the item and packaging so we can make it right
          quickly, at no cost to you.
        </p>
      </Section>

      <div className="mt-12 border-t border-charcoal/10 pt-6 text-sm text-charcoal/60">
        <p>
          Questions about an order?{" "}
          {!STATIC_EXPORT && (
            <>
              Visit your{" "}
              <Link href="/account/orders" className="text-burgundy hover:underline">
                order history
              </Link>{" "}
              or email{" "}
            </>
          )}
          {STATIC_EXPORT && <>Email{" "}</>}
          <a href={`mailto:${RETURNS_EMAIL}`} className="text-burgundy hover:underline">
            {RETURNS_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
