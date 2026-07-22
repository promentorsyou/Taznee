/**
 * Evergreen editorial guides. These are factual, educational reference
 * articles — no business claims, no pricing, no shipping promises, no
 * invented statistics. They interlink with real category pages so readers
 * can move from learning to browsing.
 *
 * Each guide is defined as data (slug, title, meta description, an intro,
 * and a `Body` component) so the index page, the `[slug]` route, metadata,
 * canonical URLs, breadcrumbs, and the sitemap all derive from one source.
 * Rendering as React (a `.tsx` module) keeps the prose readable and lets us
 * embed internal links directly, while still working in the database-free
 * static export.
 */
import Link from "next/link";
import type { ReactNode } from "react";

export interface Guide {
  slug: string;
  title: string;
  /** Short label used in cards and breadcrumbs. */
  shortTitle: string;
  /** Meta description (~155 chars max), also used as the card blurb. */
  description: string;
  /** One-line reading-time / topic hint shown under the title. */
  kicker: string;
  Body: () => ReactNode;
}

/** A styled internal link to a category or another guide. */
function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-burgundy hover:underline">
      {children}
    </Link>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-2xl mt-10 mb-3">{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-charcoal/80 leading-relaxed">{children}</p>;
}

function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-3 space-y-2 list-disc pl-5 text-charcoal/80 leading-relaxed">{children}</ul>;
}

export const GUIDES: Guide[] = [
  {
    slug: "jamdani-saree-guide",
    shortTitle: "Jamdani Saree Guide",
    title: "A Guide to Jamdani Sarees",
    kicker: "Handloom heritage · Bangladeshi textiles",
    description:
      "What Jamdani is, how the handloom weave is made, how to identify and care for it, and how to wear it — a factual guide to Bangladesh's famous saree.",
    Body: () => (
      <>
        <P>
          Jamdani is a traditional handloom weaving technique from the Bengal
          region, historically centred on the area around Dhaka, Bangladesh. It
          is known for intricate motifs that appear to float on a sheer cotton
          (and sometimes silk-blended) ground. In 2013, UNESCO inscribed the
          &ldquo;traditional art of Jamdani weaving&rdquo; on its Representative
          List of the Intangible Cultural Heritage of Humanity.
        </P>

        <H2>How Jamdani is woven</H2>
        <P>
          Jamdani is a supplementary-weft technique: the decorative pattern is
          added by hand during weaving, thread by thread, rather than printed or
          embroidered afterwards. Weavers work the motifs into the base fabric on
          a handloom, which is why no two pieces are ever perfectly identical and
          why a single elaborate saree can take weeks or months to complete.
        </P>

        <H2>How to identify a genuine handloom Jamdani</H2>
        <UL>
          <li>
            The motif is visible and slightly raised on the front, with the
            worked threads carried across the back of the fabric between motifs.
          </li>
          <li>
            The ground fabric is fine and lightweight, often semi-sheer, because
            it is woven from fine cotton yarn.
          </li>
          <li>
            Small irregularities between repeats are normal — they are evidence
            of hand weaving, not a defect.
          </li>
        </UL>

        <H2>Caring for a Jamdani saree</H2>
        <UL>
          <li>Dry cleaning is the safest choice for fine cotton and silk-blend Jamdani.</li>
          <li>Store folded in a cotton or muslin cloth, away from direct sunlight, and refold along different lines periodically to avoid permanent creases.</li>
          <li>Keep it away from perfume and deodorant sprayed directly onto the fabric, which can stain fine yarn.</li>
        </UL>

        <H2>Explore more</H2>
        <P>
          Browse the <A href="/category/sarees">saree collection</A> to see
          contemporary and traditional drapes, or read{" "}
          <A href="/guides/bangladeshi-sarees-in-the-usa">Bangladeshi Sarees in the USA</A>{" "}
          for tips on choosing and receiving a saree if you are ordering from the
          United States.
        </P>
      </>
    ),
  },
  {
    slug: "how-to-measure-for-custom-stitching",
    shortTitle: "How to Measure",
    title: "How to Measure for Custom Stitching",
    kicker: "Measurement how-to · Salwar kameez, blouse & panjabi",
    description:
      "A step-by-step guide to taking accurate body measurements for custom-stitched salwar kameez, saree blouses, and panjabi — what you need and how to measure each point.",
    Body: () => (
      <>
        <P>
          Many South Asian garments are stitched to individual measurements
          rather than sold only in standard sizes. Accurate numbers are the
          single biggest factor in a good fit. You will need a soft measuring
          tape, a well-fitting garment to reference, and ideally a second person
          to help.
        </P>

        <H2>General tips</H2>
        <UL>
          <li>Measure over well-fitting undergarments, not over bulky clothing.</li>
          <li>Keep the tape snug but not tight, and level all the way around.</li>
          <li>Stand relaxed and look straight ahead — don&apos;t hold your breath or pull your shoulders back.</li>
          <li>Record every measurement in the same unit (all inches or all centimetres).</li>
        </UL>

        <H2>Key measurements to take</H2>
        <UL>
          <li><strong>Bust / chest:</strong> around the fullest part, tape level across the back.</li>
          <li><strong>Waist:</strong> around the natural waistline, the narrowest point of the torso.</li>
          <li><strong>Hip:</strong> around the fullest part of the hips and seat.</li>
          <li><strong>Shoulder:</strong> from the edge of one shoulder seam to the other, across the back.</li>
          <li><strong>Sleeve length:</strong> from the shoulder edge to where you want the sleeve to end.</li>
          <li><strong>Top / kameez length:</strong> from the shoulder (or base of the neck) down to the desired hemline.</li>
          <li><strong>Bottom length &amp; waist:</strong> for salwar, churidar, or trousers, the waist and the full length to the ankle.</li>
        </UL>

        <H2>Measuring from a garment you already own</H2>
        <P>
          If taking body measurements is difficult, measure a garment that fits
          you well while it lies flat, and note it is a garment measurement.
          Sharing both body and reference-garment measurements helps a tailor
          reconcile the fit you want.
        </P>

        <H2>Explore more</H2>
        <P>
          See the <A href="/category/salwar-kameez">salwar kameez collection</A>{" "}
          and <A href="/category/panjabi">panjabi collection</A>, and read{" "}
          <A href="/guides/what-ready-to-ship-means">What &ldquo;Ready to Ship&rdquo; Means</A>{" "}
          to understand the difference between made-to-order and ready pieces.
        </P>
      </>
    ),
  },
  {
    slug: "what-ready-to-ship-means",
    shortTitle: "Ready to Ship",
    title: 'What "Ready to Ship" Means',
    kicker: "Buying guide · Made-to-order vs. in-stock",
    description:
      "The difference between ready-to-ship and made-to-order garments, why tailoring time affects delivery, and what each choice means for fit and timing.",
    Body: () => (
      <>
        <P>
          South Asian fashion is often sold in two forms: pieces that are already
          finished and ready to send, and pieces that are stitched or embellished
          after you order. Knowing which is which helps you plan around an event
          date and understand the fit you will receive.
        </P>

        <H2>Ready to ship</H2>
        <P>
          A ready-to-ship item is already made in a standard size and can be
          dispatched without a tailoring step. It skips the stitching queue, so
          the timeline is driven mainly by shipping. Because it is a standard
          size, you may still choose to have it altered locally for a closer fit.
        </P>

        <H2>Made to order</H2>
        <P>
          A made-to-order item is produced after you order — for example, stitched
          to your measurements, or finished with embellishment on demand. This
          adds a tailoring window before shipping, but it allows for a
          measurement-based fit. Guidance on taking measurements is in{" "}
          <A href="/guides/how-to-measure-for-custom-stitching">How to Measure for Custom Stitching</A>.
        </P>

        <H2>How this affects delivery timing</H2>
        <UL>
          <li>Ready-to-ship timelines depend on shipping only.</li>
          <li>Made-to-order timelines add a tailoring window before shipping begins.</li>
          <li>Each product page shows its own delivery estimate, so check it before ordering for a specific date.</li>
        </UL>

        <H2>Explore more</H2>
        <P>
          Browse <A href="/category/sarees">sarees</A>,{" "}
          <A href="/category/salwar-kameez">salwar kameez</A>, and{" "}
          <A href="/category/wedding">wedding wear</A> — each product page notes
          whether the piece is ready to ship or made to order.
        </P>
      </>
    ),
  },
  {
    slug: "bangladeshi-sarees-in-the-usa",
    shortTitle: "Sarees in the USA",
    title: "Bangladeshi Sarees in the USA",
    kicker: "Buyer's guide · Ordering from abroad",
    description:
      "A practical guide for US shoppers buying Bangladeshi sarees — common fabrics and weaves, what to check before ordering internationally, and how to care for them.",
    Body: () => (
      <>
        <P>
          Bangladesh has a deep saree tradition, from fine handloom Jamdani to
          cotton, silk, and richly embellished occasion sarees. If you are
          shopping from the United States, a little context makes it easier to
          choose confidently and know what to expect when a piece ships
          internationally.
        </P>

        <H2>Common fabrics and weaves</H2>
        <UL>
          <li><strong>Jamdani:</strong> fine, often semi-sheer handloom cotton with woven motifs — see the <A href="/guides/jamdani-saree-guide">Jamdani Saree Guide</A>.</li>
          <li><strong>Cotton:</strong> breathable and everyday-friendly, well suited to warm climates.</li>
          <li><strong>Silk and silk blends:</strong> more structured drape, often chosen for occasions.</li>
          <li><strong>Embellished sarees:</strong> finished with embroidery, sequins, or beadwork for weddings and festivals.</li>
        </UL>

        <H2>What to check before ordering internationally</H2>
        <UL>
          <li>Whether the piece is ready to ship or made to order — see <A href="/guides/what-ready-to-ship-means">What &ldquo;Ready to Ship&rdquo; Means</A>.</li>
          <li>Whether a matching blouse piece is included, and whether it is pre-stitched or unstitched fabric.</li>
          <li>The delivery estimate shown on the product page, so the timeline fits any event date.</li>
          <li>The <A href="/returns">returns policy</A> before you order.</li>
        </UL>

        <H2>Caring for your saree in the US</H2>
        <UL>
          <li>Follow the fabric-specific care notes; when in doubt, dry clean fine or embellished sarees.</li>
          <li>Store folded in breathable cotton or muslin, away from direct sunlight.</li>
          <li>Air the saree occasionally and refold along different lines to prevent permanent creases.</li>
        </UL>

        <H2>Explore more</H2>
        <P>
          Start with the <A href="/category/sarees">saree collection</A>, or see{" "}
          <A href="/category/wedding">wedding wear</A> for occasion pieces.
        </P>
      </>
    ),
  },
  {
    slug: "bangladeshi-wedding-outfit-guide",
    shortTitle: "Wedding Outfit Guide",
    title: "Bangladeshi Wedding Outfit Guide",
    kicker: "Occasion guide · Ceremonies & attire",
    description:
      "A guide to outfits across Bangladeshi wedding ceremonies — from the holud to the wedding day and reception — with notes on colours, fabrics, and planning ahead.",
    Body: () => (
      <>
        <P>
          A Bangladeshi wedding usually unfolds over several events, each with its
          own mood and traditional attire. This guide outlines the main ceremonies
          and the kinds of outfits commonly worn, so you can plan what to wear —
          whether you are part of the wedding party or a guest.
        </P>

        <H2>The main ceremonies</H2>
        <UL>
          <li><strong>Holud (gaye holud):</strong> a festive turmeric ceremony where yellow, orange, and other bright colours are traditional.</li>
          <li><strong>Akd / wedding day:</strong> the formal ceremony, where richly embellished sarees, lehengas, and sherwani or panjabi are common.</li>
          <li><strong>Reception (bou-bhat):</strong> the celebration hosted after the wedding, often with elegant, more subdued formalwear.</li>
        </UL>

        <H2>Outfits by role</H2>
        <UL>
          <li><strong>Bride:</strong> often an embellished saree or lehenga, with heavier work reserved for the main day.</li>
          <li><strong>Groom:</strong> commonly a sherwani or an ornate <A href="/category/panjabi">panjabi</A> for the ceremony.</li>
          <li><strong>Guests:</strong> festive but not overshadowing the couple — a <A href="/category/sarees">saree</A> or <A href="/category/salwar-kameez">salwar kameez</A> is a dependable choice.</li>
        </UL>

        <H2>Planning ahead</H2>
        <P>
          Wedding pieces are often embellished or made to order, which adds
          tailoring time before shipping — read{" "}
          <A href="/guides/what-ready-to-ship-means">What &ldquo;Ready to Ship&rdquo; Means</A>{" "}
          and take accurate measurements early using{" "}
          <A href="/guides/how-to-measure-for-custom-stitching">How to Measure for Custom Stitching</A>.
          Always check the delivery estimate on each product page against your
          event date.
        </P>

        <H2>Explore more</H2>
        <P>
          Browse <A href="/category/wedding">wedding wear</A>,{" "}
          <A href="/category/jewelry">jewelry</A>, and the full{" "}
          <A href="/category/sarees">saree collection</A>.
        </P>
      </>
    ),
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
