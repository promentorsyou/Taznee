import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { centsToDisplay } from "@/lib/money";
import { DeliveryEstimateBadge } from "@/components/delivery-estimate";
import { AddToCartForm } from "@/components/add-to-cart-form";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { include: { inventory: true } },
      designer: true,
      category: true,
    },
  });

  if (!product || !product.isActive) notFound();

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];

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

        <AddToCartForm
          productId={product.id}
          productSlug={product.slug}
          variants={product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            inStock: (v.inventory?.quantity ?? 0) > 0,
          }))}
          sizes={sizes}
          colors={colors}
        />
      </div>
    </div>
  );
}
