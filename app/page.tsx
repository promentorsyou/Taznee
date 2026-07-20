import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getHomepageData } from "@/lib/catalog";

export const revalidate = 60;

// Editorial hero photo (Pexels License — free for commercial use, no
// attribution required). Placeholder photography for the demo; swap for
// real Taznee campaign imagery before launch.
const HERO_IMAGE =
  "https://images.pexels.com/photos/9419032/pexels-photo-9419032.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default async function HomePage() {
  const { categories, featured } = await getHomepageData();

  return (
    <div>
      <section className="relative bg-charcoal text-ivory overflow-hidden">
        {/* Desktop-only hero image fills the right half; a left-to-right
            gradient fades it into the charcoal so the headline stays
            legible. Hidden on mobile, where the compact dark block reads
            better than a letterboxed photo. */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-1/2" aria-hidden="true">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-charcoal/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="md:max-w-[60%]">
            <p className="uppercase tracking-[0.2em] text-gold text-xs mb-4">
              Dhaka to Doorstep, Across the USA
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl leading-tight">
              Original Bangladeshi fashion, made for you.
            </h1>
            <p className="mt-6 max-w-xl text-ivory/75">
              Taznee partners with Bangladeshi designers to bring hand-embroidered sarees, salwar
              kameez, panjabi, wedding wear, and jewelry directly to customers across the United
              States — with transparent delivery estimates on every order.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/category/sarees"
                className="bg-burgundy text-ivory px-6 py-3 rounded-md hover:bg-burgundy/90 transition"
              >
                Shop Sarees
              </Link>
              <Link
                href="/category/wedding"
                className="border border-ivory/30 px-6 py-3 rounded-md hover:bg-ivory/10 transition"
              >
                Shop Wedding
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-serif text-2xl mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="border border-charcoal/10 rounded-lg p-6 text-center hover:border-burgundy hover:text-burgundy transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-serif text-2xl mb-6">Featured Pieces</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-forest/5 border-y border-forest/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-serif text-lg text-forest mb-2">Direct from Bangladesh</h3>
            <p className="text-charcoal/70">
              Every piece is sourced from real designers and artisans in Dhaka, shipped
              internationally straight to your US address.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg text-forest mb-2">Clear Delivery Estimates</h3>
            <p className="text-charcoal/70">
              Every product page shows a realistic delivery window, factoring in tailoring time
              and international transit — no surprises at checkout.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg text-forest mb-2">Secure US Checkout</h3>
            <p className="text-charcoal/70">
              Pay safely in USD via Stripe. Shipping is calculated by weight and destination
              zone before you confirm your order.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
