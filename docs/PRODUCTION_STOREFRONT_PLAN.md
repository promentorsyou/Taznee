STATUS: IN PROGRESS

# Taznee Production Storefront — Work Plan

Source of truth for the auto-continue scheduler ("Taznee storefront auto-continue").
Each firing implements the **next unchecked SAFE item**, verifies, commits, and pushes.
When every SAFE item is checked, set the first line to `STATUS: ALL SAFE WORK COMPLETE`.

Rules (never violate): no invented reviews, legal text, shipping promises, designer
stories, stock numbers, or fake data. Demo/static build stays `noindex` until the owner
sets `NEXT_PUBLIC_INDEXABLE=true`. Never commit secrets.

## Context
The audit describes the **GitHub Pages static preview** (database-free export). The full
functional app (cart, Stripe test checkout, order history, variants, filters) already
exists and deploys to Vercel. Static-only limitations are intentional. Two builds:
`npm run build` (live/Vercel) and `./scripts/build-static.sh` (GitHub Pages, no DB).

## SAFE items (scheduler implements these, in order)
- [x] SEO honesty: `noindex` for demo; add `NEXT_PUBLIC_INDEXABLE` env; robots + metadata robots reflect it.
- [x] Canonical URLs on every page (`alternates.canonical`).
- [x] Product-specific Twitter cards (exact product title/description/image) + og:url/og:type.
- [x] JSON-LD Organization + WebSite site-wide (layout).
- [x] JSON-LD Product + Offer + MerchantReturnPolicy + BreadcrumbList on product pages; BreadcrumbList on category pages.
- [x] Visible breadcrumbs component on product + category pages.
- [x] Fix footer "Order History" 404 on the static build (conditional on live app).
- [x] LAUNCH_CONFIG.md handoff doc (env vars, Stripe, DB, email, domain, analytics, image reqs, shipping/duties decisions, legal-owner approvals).
- [x] Google Merchant Center product feed at `/feed.xml` (live app only; excluded from static build).
- [x] Automated internal-link checker (crawl built static `out/`, fail on broken nav/footer links); wire into CI.
- [x] Cart icon with live item count in the header (live app).
- [x] Category sorting (price asc/desc, newest) alongside existing filters, URL-driven.
- [x] Reviews data model (schema) + verified-only review UI with honest empty state (NO fake reviews).
- [x] Analytics event abstraction: GA4 + Meta Pixel via env, consent-gated; emit view_item, add_to_cart, begin_checkout, purchase, sign_up (search wires when search ships). Meta CAPI = owner follow-up (token + server relay).
- [x] Email signup form with explicit consent + durable subscribe route (DB-backed; provider = owner follow-up), configurable welcome-offer copy.
- [x] Evergreen SEO guides (factual, no business claims): Jamdani Saree Guide, How to Measure for Custom Stitching, What "Ready to Ship" Means, Bangladeshi Sarees in the USA, Bangladeshi Wedding Outfit Guide. Interlink with products/categories.
- [ ] Size guide / measurement chart content + modal on product pages.
- [ ] Product image gallery: thumbnails + zoom/lightbox.
- [ ] Header search over product names/categories (live app; static shows disabled note).
- [ ] Shop-by-occasion: add optional Product.occasions data + landing pages (Eid, Holud, Mehndi, Nikkah, Wedding Guest, Reception, Gifts) driven by real tagged products only.

## OWNER-BLOCKED items (NOT for the scheduler — need the owner's input/credentials)
These are listed for handoff; do not fabricate them.
- Real licensed product photography to replace Pexels placeholders.
- Legal/policy text the owner or their lawyer must supply: Privacy Policy, Terms & Conditions, exact Shipping Policy, duties DDP-vs-DDU decision, and final Return rules sign-off.
- About / Our Artisans real content (real designer/atelier bios — currently only fictional demo designers exist).
- Stripe live keys + real business/bank; custom domain; production Postgres (e.g. Neon).
- Email/SMS provider account + API keys (welcome, abandoned cart, review request).
- Analytics IDs: GA4 measurement ID, Meta Pixel ID + CAPI token; consent-management choice.
- Business entity (LLC) details, support email/phone, physical + return mailing address.
- Flip `NEXT_PUBLIC_INDEXABLE=true` only after the above are real.
