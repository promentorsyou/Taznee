import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { centsToDisplay } from "@/lib/money";
import { DeliveryEstimateBadge } from "@/components/delivery-estimate";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductMetaTags } from "@/components/product-meta-tags";
import { ReviewsSection } from "@/components/reviews-section";
import { ShareButton } from "@/components/share-button";
import { SizeGuideModal } from "@/components/size-guide-modal";
import { RecentlyViewed } from "@/components/recently-viewed";
import { TrackEvent } from "@/components/track-event";
import { getProductDetailData, getRelatedProducts } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";
import { getApprovedReviews, summarizeReviews } from "@/lib/reviews";
import { productBreadcrumbs, productJsonLd, productMetadata } from "@/lib/product-seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetailData(slug);
  if (!product) return { title: "Product not found" };
  return productMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductDetailData(slug);
  if (!product) notFound();

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];

  const reviews = await getApprovedReviews(product.id);
  const reviewSummary = summarizeReviews(reviews);
  const related = await getRelatedProducts(product.category.slug, product.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {productJsonLd(product, reviewSummary).map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <TrackEvent
        event="view_item"
        params={{
          currency: "USD",
          value: product.basePriceCents / 100,
          items: [{ item_id: product.slug, item_name: product.name }],
        }}
      />
      <ProductMetaTags priceCents={product.basePriceCents} readyToShip={product.readyToShip} />
      <Breadcrumbs items={productBreadcrumbs(product)} />
      <div className="grid md:grid-cols-2 gap-12">
      <ProductGallery images={product.images} productName={product.name} />

      <div>
        {product.designer && (
          <p className="text-xs uppercase tracking-wide text-charcoal/50 mb-1">
            {product.designer.name}
          </p>
        )}
        <h1 className="font-serif text-3xl mb-2">{product.name}</h1>
        <p className="text-charcoal/50 text-sm mb-4">{product.category.name}</p>
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-medium">{centsToDisplay(product.basePriceCents)}</span>
          {product.compareAtCents && product.compareAtCents > product.basePriceCents && (
            <span className="text-charcoal/40 line-through">{centsToDisplay(product.compareAtCents)}</span>
          )}
        </div>

        <p className="text-charcoal/80 leading-relaxed mb-6">{product.description}</p>

        <div className="mb-6 p-4 bg-forest/5 rounded-md border border-forest/10">
          <DeliveryEstimateBadge
            readyToShip={product.readyToShip}
            processingMinDays={product.processingMinDays}
            processingMaxDays={product.processingMaxDays}
            transitMinDays={product.transitMinDays}
            transitMaxDays={product.transitMaxDays}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <SizeGuideModal />
        </div>

        <AddToCartForm
          productSlug={product.slug}
          productName={product.name}
          basePriceCents={product.basePriceCents}
          imageUrl={product.images[0]?.url ?? null}
          variants={product.variants}
          sizes={sizes}
          colors={colors}
        />

        <div className="mt-5">
          <ShareButton
            url={absoluteUrl(`/product/${product.slug}`)}
            title={product.name}
            text={product.description.slice(0, 120)}
          />
        </div>
      </div>
      </div>

      <ReviewsSection reviews={reviews} summary={reviewSummary} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-serif text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed
        current={{
          slug: product.slug,
          name: product.name,
          basePriceCents: product.basePriceCents,
          compareAtCents: product.compareAtCents,
          readyToShip: product.readyToShip,
          imageUrl: product.images[0]?.url ?? null,
          designerName: product.designer?.name ?? null,
        }}
      />
    </div>
  );
}
