/**
 * Open Graph product tags (`product:price:amount` etc.) so a shared product
 * link previews with the real price and availability on Facebook,
 * Messenger, WhatsApp, and Pinterest.
 *
 * These are rendered as elements rather than through Next's `metadata`
 * export on purpose: the metadata API's `other` field emits `<meta name=…>`,
 * but the Open Graph protocol requires `<meta property=…>`, which the
 * scrapers actually look for. React hoists `<meta>` rendered anywhere in
 * the tree into `<head>`, so this produces correct markup.
 *
 * Price and availability are read from the real product record — never
 * hard-coded — so they cannot drift from what the page and schema show.
 */
export function ProductMetaTags({
  priceCents,
  readyToShip,
}: {
  priceCents: number;
  readyToShip: boolean;
}) {
  return (
    <>
      <meta property="product:price:amount" content={(priceCents / 100).toFixed(2)} />
      <meta property="product:price:currency" content="USD" />
      {/* "preorder" is the OG vocabulary term for made-to-order stock. */}
      <meta property="product:availability" content={readyToShip ? "in stock" : "preorder"} />
    </>
  );
}
