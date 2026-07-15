# Taznee

Taznee is a premium e-commerce platform concept that brings original Bangladeshi fashion —
sarees, salwar kameez, panjabi, wedding wear, and jewelry — from Bangladeshi designers directly
to customers across the United States, with transparent, business-day-aware delivery estimates
and weight-based international shipping pricing calculated at checkout.

This repository is a working full-stack demo/reference implementation, not a production system.
All product copy, designer names, and branding are original to this project. Placeholder product
photography is real garment photos sourced from [Pexels](https://www.pexels.com) under the
[Pexels License](https://www.pexels.com/license/) (free for commercial use, no attribution
required) — nothing is scraped or copied from any third-party retailer or brand. For a real
launch, replace these with actual product photography, as noted below.

## Stack

- **Next.js 16 (App Router)** + **TypeScript** (strict mode)
- **Tailwind CSS v4** — warm ivory background, deep charcoal text, burgundy/forest-green/gold
  accents, serif headings + sans body
- **Prisma** + **PostgreSQL**
- **Auth.js (NextAuth v5)** — credentials (email/password) auth
- **Stripe** (test mode) via Stripe Elements for checkout payments
- **Vitest** for unit tests of pure business logic (`lib/`)
- **Playwright** for end-to-end browser tests (`e2e/`)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL` — a PostgreSQL connection string
- `NEXTAUTH_SECRET` — any random string (`openssl rand -base64 32`)
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — Stripe **test mode** keys from your Stripe
  dashboard (https://dashboard.stripe.com/test/apikeys)
- `STRIPE_WEBHOOK_SECRET` — required for `/api/webhooks/stripe` to accept requests (it always
  verifies the Stripe signature and rejects unsigned/unconfigured requests — there is no
  fallback that trusts an unverified payload). The demo checkout flow also reconciles payment
  status directly on the confirmation page, so local development works without a public webhook
  URL even before you set this. To test the webhook locally, run `stripe listen --forward-to
  localhost:3000/api/webhooks/stripe` (Stripe CLI) and use the signing secret it prints.
- `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3000`

### 3. Set up the database

```bash
npm run db:push     # create tables from prisma/schema.prisma (or use `db:migrate` for real migrations)
npm run db:seed      # populate categories, designers, ~18 products, demo users, and a demo order
```

Seeded accounts:

- Customer: `demo@taznee.com` / `password123` (has one demo `IN_TRANSIT` order)
- Admin: `admin@taznee.com` / `adminpass123` (can view `/admin/products`)

### 4. Run the dev server

```bash
npm run dev
```

Visit http://localhost:3000.

## Testing

### Unit tests (business logic)

```bash
npm run test          # vitest run, once
npm run test:watch    # watch mode
```

Covers `lib/money.ts` (integer-cents price/discount math), `lib/shipping.ts` (weight/zone-based
shipping cost calculator), and `lib/delivery.ts` (business-day-aware delivery estimate
calculator). 27 tests, all pure functions, no DB/network required.

### End-to-end tests (Playwright)

```bash
npm run test:e2e
```

**Requires**, before running:

1. A running dev server (`npm run dev`) pointed at a seeded database (ideally a dedicated test
   database — run `db:push` + `db:seed` against it first).
2. Stripe test-mode keys configured in `.env`.
3. `npx playwright install chromium` if browsers haven't been downloaded yet.

`e2e/checkout.spec.ts` covers: browse a category → open a product detail page → add to cart →
sign in as the seeded demo customer → checkout (address → calculated shipping → Stripe test card
`4242 4242 4242 4242`) → order confirmation page.

This environment does not have a running Postgres instance or network access to Stripe/Chromium
downloads, so the e2e suite was verified for syntax and correct test discovery
(`npx playwright test --list`) but not executed end-to-end here.

## Project structure

- `app/` — Next.js App Router pages and API routes
  - `error.tsx` / `global-error.tsx` / `not-found.tsx` — error boundaries and 404 page
  - `robots.ts` / `sitemap.ts` — SEO crawl directives and sitemap (DB-backed; `*.static.ts`
    variants exist for the GitHub Pages build, see below)
- `components/` — shared React components (server + client)
- `lib/` — pure business logic (`money.ts`, `shipping.ts`, `delivery.ts`, `shipping-data.ts`) plus
  infra singletons (`prisma.ts`, `stripe.ts`) and the shared catalog data layer (`catalog.ts`)
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — demo data seed script
- `e2e/` — Playwright end-to-end tests
- `.github/workflows/ci.yml` — lint, typecheck, unit tests, and both production builds on every
  push/PR
- `.github/workflows/deploy-pages.yml` — publishes the static preview to GitHub Pages

## Static UI preview (GitHub Pages)

`.github/workflows/deploy-pages.yml` publishes a **database-free, read-only preview**
of the browsable storefront (homepage, category pages, product pages) to GitHub
Pages on every push to `main`. It uses the in-memory fixture data in
`lib/static-data.ts` instead of Postgres, since GitHub Pages only serves static
files and has no server runtime.

**Not included in the static preview** — because they need a live server/database:
cart, checkout, sign-in/accounts, the admin dashboard, and category filtering
(only `searchParams`-free pages can be statically exported). Those work in the
full app (`npm run dev` locally, or the Vercel deployment described above).

To enable it: in the repo's GitHub Settings → Pages, set **Source** to
"GitHub Actions". The workflow will then publish to
`https://<your-github-username>.github.io/<repo-name>/` on the next push to `main`.

To build the static export locally:

```bash
npm ci
npx prisma generate
GITHUB_PAGES_REPO=<repo-name> ./scripts/build-static.sh
# output is in ./out — serve it with any static file server to preview
npx serve out
```

`scripts/build-static.sh` temporarily moves server-only routes (`app/api`,
`app/cart`, `app/checkout`, `app/login`, `app/register`, `app/account`,
`app/admin`, `app/actions`) out of the build and swaps in the `*.static.tsx`
variants of the header, category, and product pages that don't reference
auth/server actions — then always restores everything afterward, even on
build failure.

## Hardening notes

The following were addressed in a security/reliability pass on top of the initial build:

- **Stripe webhook signature is always verified** — an earlier version had a fallback that
  trusted unsigned request bodies when `STRIPE_WEBHOOK_SECRET` wasn't set, which would have let
  anyone POST a fake `payment_intent.succeeded` event and mark an arbitrary order as paid. The
  endpoint now rejects any request without a valid signature.
- **Checkout address input is validated server-side** with Zod (state as a 2-letter code, ZIP as
  a valid US postal code format) instead of trivial truthy checks, and address/order/order-item
  creation happens inside a single `prisma.$transaction` so a mid-request failure can never leave
  an orphaned `Address` row with no `Order`.
- **PaymentIntent creation uses an idempotency key** (`order-<orderId>`) so a client retry after a
  network blip can't create a duplicate charge for the same order.
- **Security response headers** (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`) are set on the live deployment.
- **Error boundaries** (`app/error.tsx`, `app/global-error.tsx`) and a branded 404 page
  (`app/not-found.tsx`) replace Next.js's default error screens.
- **SEO**: per-page `generateMetadata` (title/description/Open Graph) on product and category
  pages, `robots.ts`, and a DB-backed `sitemap.ts` (with a static-fixture variant for the GitHub
  Pages build).
- **CI** (`.github/workflows/ci.yml`) now runs lint, typecheck, unit tests, the production build,
  and the static-export build on every push and pull request — so none of the above can silently
  regress.

## Known Limitations / Not Yet Implemented

This is a scoped demo build. The following are intentionally out of scope:

- **Multi-vendor seller portal** — designers/vendors cannot log in to manage their own listings;
  all catalog data is seeded/admin-only.
- **Live shipping carrier APIs** — shipping cost and transit time come from a static weight/zone
  rate table (`lib/shipping-data.ts`), not a real carrier integration (e.g. DHL, FedEx).
- **Tax provider integration** — `Order.taxCents` exists in the schema but is always `0`; no
  sales tax calculation (e.g. Stripe Tax, Avalara) is wired up.
- **Full admin CRUD** — `/admin/products` is read-only. There is no admin UI to create, edit,
  deactivate, or restock products/categories/designers.
- **Inventory reservation** — checkout does not decrement or reserve `Inventory.quantity`, so
  concurrent orders for the same limited variant can oversell. A production deployment needs a
  reservation/lock step in `create-order` before creating the PaymentIntent.
- **Email/SMS notifications** — no order confirmation emails, shipping updates, or password
  reset flows.
- **Rate limiting** — `/api/register` and other public endpoints have no rate limiting; add one
  (e.g. Upstash Ratelimit, Vercel's built-in protections) before a real launch.
- **Search service** — category filtering exists, but there is no full-text/typo-tolerant product
  search (e.g. Algolia, Meilisearch, Postgres full-text search).
- **CMS** — homepage and category copy are hardcoded in the app, not editable via a CMS.
- **Internationalization (i18n)** — English only; USD only.
- **Visual regression tests** — only unit tests (Vitest) and functional e2e tests (Playwright)
  exist; no screenshot/visual diffing.
- **Wishlist UI** — the `Wishlist`/`WishlistItem` models exist in the schema for future use but
  there is no wishlist page or "save for later" UI yet.
- **Stripe webhook still needs a public URL configured in production** — the checkout
  confirmation page additionally reconciles payment status directly with Stripe for local/demo
  convenience (no public webhook URL required to test locally), but a real deployment should
  configure the Stripe webhook endpoint and rely on `/api/webhooks/stripe` as the source of
  truth.
