/**
 * Static-export-only variant of the product detail page, swapped in for
 * app/product/[slug]/page.tsx by scripts/build-static.sh. Has no import
 * on AddToCartForm/app/actions (which require a server runtime) so the
 * `next build --output export` bundler never has to resolve them.
 */
import { notFound } from "next/navigation";
import Image from "next/image";
import { centsToDisplay } from "@/lib/money";
import { DeliveryEstimateBadge } from "@/components/delivery-estimate";
import { getProductDetailData, getAllStaticSlugs } from "@/lib/catalog";

export async function generateStaticParams() {
  return getAllStaticSlugs().productSlugs.map((slug) => ({ slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductDetailData(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-12">
      <div className="grid grid-cols-2 gap-3">
        {product.images.map((img) => (
          <div key={img.id} className="relative aspect-[3/4] rounded-md overflow-hidden bg-charcoal/5 first:col-span-2">
            <Image src={img.url} alt={img.altText ?? product.name} fill className="object-cover" sizes="50vw" />
          </div>
        ))}
      </div>

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

        <div className="border border-charcoal/15 rounded-md p-4 text-sm text-charcoal/70">
          This is a static UI preview — cart and checkout require the live deployment with a
          connected database. See the README for how to run or deploy the full app.
        </div>
      </div>
    </div>
  );
}
