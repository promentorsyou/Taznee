import Image from "next/image";
import Link from "next/link";
import { centsToDisplay, discountPercent } from "@/lib/money";

export interface ProductCardData {
  slug: string;
  name: string;
  basePriceCents: number;
  compareAtCents: number | null;
  readyToShip: boolean;
  imageUrl: string | null;
  designerName?: string | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const pct = discountPercent(product.basePriceCents, product.compareAtCents);
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/5 rounded-md">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {product.readyToShip && (
          <span className="absolute top-2 left-2 bg-forest text-ivory text-[11px] px-2 py-1 rounded">
            Ready to Ship
          </span>
        )}
        {pct > 0 && (
          <span className="absolute top-2 right-2 bg-burgundy text-ivory text-[11px] px-2 py-1 rounded">
            -{pct}%
          </span>
        )}
      </div>
      <div className="mt-3">
        {product.designerName && (
          <p className="text-xs uppercase tracking-wide text-charcoal/50">{product.designerName}</p>
        )}
        <h3 className="font-serif text-base">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-medium">{centsToDisplay(product.basePriceCents)}</span>
          {product.compareAtCents && product.compareAtCents > product.basePriceCents && (
            <span className="text-charcoal/40 line-through text-sm">
              {centsToDisplay(product.compareAtCents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
