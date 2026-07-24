# Taznee — Launch Configuration

Everything the owner must provide, decide, or set up before Taznee can go live as a
real US storefront. Nothing here is fabricated — placeholders are marked `TODO(owner)`.

The app runs in two forms:
- **Live app** (`npm run build`, deploy to Vercel): full cart, Stripe checkout, order
  history, admin. Needs a Postgres database and the env vars below.
- **Static preview** (`./scripts/build-static.sh`, GitHub Pages): database-free marketing
  preview. No cart/checkout. Intentionally `noindex`.

---

## 1. Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL` | Live app | Postgres connection string (e.g. Neon, Supabase, Vercel Postgres). |
| `NEXTAUTH_SECRET` | Live app auth | `openssl rand -base64 32`. |
| `STRIPE_SECRET_KEY` | Checkout | Stripe **test** key first (`sk_test_…`), live key at launch. |
| `STRIPE_PUBLISHABLE_KEY` | Checkout | `pk_test_…` / `pk_live_…`. |
| `STRIPE_WEBHOOK_SECRET` | Checkout | From the Stripe webhook endpoint (`whsec_…`). Required — the webhook rejects unsigned requests. |
| `NEXT_PUBLIC_SITE_URL` | SEO/emails | Canonical site origin, e.g. `https://taznee.com`. Used for canonical tags, sitemap, JSON-LD, Stripe return URLs. |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | Payments | **Leave unset until the LLC + Stripe are ready.** See section 2. Controls only the checkout UI — the server still refuses to charge without secret Stripe keys. |
| `NEXT_PUBLIC_INDEXABLE` | SEO gate | **Leave unset until launch.** Set to `true` only when real product photos, legal pages, and a working checkout are all live. Until then the whole site is `noindex` and `robots.txt` disallows all — by design (do not market or index a demo). |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Contact/schema | Real support inbox, e.g. `care@taznee.com`. Defaults to a placeholder. |
| `EASYPOST_API_KEY` | Live shipping rates (optional) | If unset, checkout uses the static weight/zone rate table. See README "Live shipping rates". |
| `SHIP_FROM_*` | Live shipping rates | Origin address for carrier quotes (`SHIP_FROM_NAME/STREET1/CITY/STATE/ZIP/COUNTRY/PHONE`). |

Never commit real values — use `.env` locally and the host's secret store in production.
`.env.example` lists every variable.

## 2. Payments & Stripe setup

### Current state: payments are OFF

`NEXT_PUBLIC_PAYMENTS_ENABLED` is unset, so the storefront runs in a
**browse-and-build-a-cart** mode that is safe to show customers today:

| Works now | Deliberately off |
|---|---|
| Guest cart (no sign-in), persisted per device | Placing an order |
| Cart drawer, cart page, quantity edits, removal | Taking any payment |
| Checkout contact + shipping + shipping cost + order review | Collecting card details |
| Product sharing, search, occasions, guides | Order confirmation emails |

With payments off the checkout page shows an explicit notice that checkout is
launching soon, the submit button is disabled, and the page states in plain
language that **no order has been created and nothing has been charged**.
No card field is ever rendered. Taznee never handles card data in any mode —
when Stripe is enabled, card entry happens inside Stripe's own iframe.

### Turning payments on (after the Delaware LLC + Stripe account exist)

Do these **in order**, in test mode first:

1. Create the Stripe account and complete business verification with the LLC
   details (EIN, registered address, bank account for payouts).
2. Copy the **test** keys from https://dashboard.stripe.com/test/apikeys into
   your host's secret store (Vercel → Project → Settings → Environment Variables):
   - `STRIPE_SECRET_KEY` = `sk_test_…`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_test_…`
   Never commit these, and never rename them with a `NEXT_PUBLIC_` prefix.
3. Add a webhook endpoint at `https://<your-domain>/api/webhooks/stripe`,
   subscribe to `payment_intent.succeeded`, and copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`. The handler rejects unsigned requests, so this is
   required, not optional.
4. Provision the production database and run migrations (section 3) — orders
   need somewhere to persist before you accept money.
5. Set `NEXT_PUBLIC_PAYMENTS_ENABLED="true"` and redeploy.
6. Place a full test order with card `4242 4242 4242 4242` (any future expiry,
   any CVC). Confirm: the order appears in the database, the webhook fires, and
   the confirmation page shows the order as paid.
7. Swap the test keys for live keys (`sk_live_…` / `pk_live_…`), re-point the
   webhook at the live endpoint, update `STRIPE_WEBHOOK_SECRET`, and redeploy.
8. Place one small real order and refund it, to verify the live path end to end.

To turn payments back off at any point, set `NEXT_PUBLIC_PAYMENTS_ENABLED=false`
and redeploy — the storefront returns to the safe browse-and-cart mode.

**TODO(owner):** Delaware LLC formation + EIN, business bank account, and the
Stripe account itself.

## 3. Database setup

1. Provision Postgres (Neon/Supabase/Vercel Postgres) and set `DATABASE_URL`.
2. `npx prisma migrate deploy` (or `npm run db:push` for a fresh DB).
3. `npm run db:seed` loads demo catalog. **TODO(owner):** replace demo products/designers
   with the real catalog before launch.

## 4. Email provider (planned)

Newsletter signups **are** captured durably in the DB (`NewsletterSubscriber`, via
`/api/newsletter`, consent required) — no signups are lost. But no email is actually
**sent** yet. **TODO(owner):** choose a provider (e.g. Resend, Postmark, Klaviyo) and
supply API keys, then: sync/forward newsletter subscribers, and wire order confirmation,
shipping updates, password reset, and welcome/abandoned-cart/review-request emails. Until
then, order confirmation is on-site only. Optional promo copy above the signup form:
`NEXT_PUBLIC_WELCOME_OFFER` (leave unset to imply no discount).

## 5. Custom domain

1. Point your domain at the host (Vercel: add domain + DNS records).
2. Set `NEXT_PUBLIC_SITE_URL` to the final origin.
3. Only then set `NEXT_PUBLIC_INDEXABLE=true` and submit the sitemap to Google Search Console.

## 6. Analytics

The event abstraction, consent gate, and client-side GA4 + Meta Pixel are implemented
(`lib/analytics.ts`, `components/analytics-provider.tsx`). Events emitted: `view_item`,
`add_to_cart`, `begin_checkout`, `purchase`, `sign_up` (and `search` once search ships).
With no IDs set, no scripts load and no consent banner shows.

**TODO(owner):**
- Set `NEXT_PUBLIC_GA4_ID` and/or `NEXT_PUBLIC_META_PIXEL_ID`. A consent banner then appears
  and nothing tracks until the visitor accepts.
- Server-side **Meta CAPI** is not wired (needs an access token + a server relay). If you want
  CAPI, provide `META_CAPI_TOKEN` and request the `/api/meta-capi` relay as a follow-up.
- Confirm the consent model meets your legal obligations (EU/UK/CA). The current banner is a
  simple accept/decline; a full consent-management platform may be required in some regions.

## 7. Product images

Catalog currently uses free-license Pexels placeholders (not the real products).
**TODO(owner):** supply real, licensed photography of the actual items — ideally 3–5 views
each, portrait 3:4, ≥1200px on the long edge, with meaningful filenames. Prefer a media
host/CDN (Cloudinary or the host's image pipeline). Update `next.config.ts` `images.remotePatterns`
for the new host.

## 8. Shipping, duties & returns decisions (owner)

These values drive checkout copy, schema, and the returns page — they must be real:
- **TODO(owner):** DDP vs DDU — are US import duties/taxes included in the price, estimated at
  checkout, or paid by the customer on delivery? Current copy does not promise duty-paid.
- **TODO(owner):** confirm the shipping rate table in `lib/shipping-data.ts` (or switch to
  live EasyPost rates) reflects real negotiated costs.
- **TODO(owner):** sign off the return window (currently 14 days) and who pays return shipping
  (currently: customer pays for change-of-mind; Taznee pays for defects) in `app/returns/page.tsx`.
  These must stay consistent with the `MerchantReturnPolicy` JSON-LD in `lib/seo.ts`.

## 9. Legal pages (owner / legal counsel)

Not written — must not be fabricated. **TODO(owner):** provide real text for Privacy Policy,
Terms & Conditions, and the full Shipping Policy, plus business entity details (LLC name,
registered address, return mailing address, support phone). The About / Our Artisans page
needs real designer/atelier bios (only fictional demo designers exist today).

## 10. Sales tax (planned)

`Order.taxCents` is currently always 0. **TODO(owner):** decide on a tax approach
(e.g. Stripe Tax) and nexus states before charging US customers.

---

## Pre-launch checklist
- [ ] Real product catalog + licensed photos loaded
- [ ] Legal pages (Privacy, Terms, Shipping) written and linked
- [ ] Stripe live keys + webhook configured and tested
- [ ] Production Postgres migrated + seeded with real data
- [ ] Email provider connected (at least order confirmation)
- [ ] Duties/tax approach decided and reflected in checkout + schema
- [ ] Custom domain live, `NEXT_PUBLIC_SITE_URL` set
- [ ] `NEXT_PUBLIC_INDEXABLE=true` set, sitemap submitted to Search Console
- [ ] Analytics IDs + consent management configured
