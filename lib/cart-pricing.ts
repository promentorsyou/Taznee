/**
 * Server-side re-pricing of a client-submitted cart.
 *
 * The cart lives in the browser (localStorage), so the checkout API
 * receives only variant IDs and quantities. **Prices are never taken from
 * the client** — every line is looked up in the database and re-priced
 * there. A tampered request can therefore change *what* is ordered, but
 * never *what it costs*.
 *
 * Quantities are validated and clamped, and inactive products or
 * out-of-stock variants are rejected before an order is created.
 */
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { lineTotalCents, sumCents } from "@/lib/money";
import { MAX_QUANTITY_PER_LINE } from "@/lib/cart";

export const cartLineSchema = z.object({
  variantId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_LINE),
});

export const cartItemsSchema = z
  .array(cartLineSchema)
  .min(1, "Cart is empty")
  .max(50, "Too many items in one order");

export type CartLineInput = z.infer<typeof cartLineSchema>;

export interface PricedLine {
  variantId: string;
  quantity: number;
  /** Authoritative unit price, read from the database. */
  unitPriceCents: number;
  lineTotalCents: number;
  nameSnapshot: string;
  sizeSnapshot: string;
  colorSnapshot: string;
  weightGrams: number;
  readyToShip: boolean;
  processingMinDays: number;
  processingMaxDays: number;
}

export class CartPricingError extends Error {}

/**
 * Resolves client cart lines against the database and returns
 * authoritative pricing. Throws CartPricingError (a 400-class problem)
 * when a line references something that cannot be ordered.
 */
export async function priceCartLines(lines: CartLineInput[]): Promise<{
  lines: PricedLine[];
  subtotalCents: number;
  itemWeightsGrams: number[];
}> {
  // Merge duplicate variant ids so a repeated line can't bypass the
  // per-line quantity cap.
  const merged = new Map<string, number>();
  for (const line of lines) {
    const total = (merged.get(line.variantId) ?? 0) + line.quantity;
    if (total > MAX_QUANTITY_PER_LINE) {
      throw new CartPricingError(
        `You can order at most ${MAX_QUANTITY_PER_LINE} of any single item.`,
      );
    }
    merged.set(line.variantId, total);
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: [...merged.keys()] } },
    include: { product: true, inventory: true },
  });

  const byId = new Map(variants.map((v) => [v.id, v]));
  const priced: PricedLine[] = [];

  for (const [variantId, quantity] of merged) {
    const variant = byId.get(variantId);
    if (!variant) {
      throw new CartPricingError("An item in your bag is no longer available.");
    }
    if (!variant.product.isActive) {
      throw new CartPricingError(`"${variant.product.name}" is no longer available.`);
    }
    const stock = variant.inventory?.quantity ?? 0;
    if (stock < quantity) {
      throw new CartPricingError(
        `"${variant.product.name}" (${variant.size} / ${variant.color}) is out of stock.`,
      );
    }

    const unitPriceCents = variant.priceCents ?? variant.product.basePriceCents;
    priced.push({
      variantId,
      quantity,
      unitPriceCents,
      lineTotalCents: lineTotalCents(unitPriceCents, quantity),
      nameSnapshot: variant.product.name,
      sizeSnapshot: variant.size,
      colorSnapshot: variant.color,
      weightGrams: variant.product.weightGrams,
      readyToShip: variant.product.readyToShip,
      processingMinDays: variant.product.processingMinDays,
      processingMaxDays: variant.product.processingMaxDays,
    });
  }

  return {
    lines: priced,
    subtotalCents: sumCents(priced.map((l) => l.lineTotalCents)),
    itemWeightsGrams: priced.flatMap((l) => Array<number>(l.quantity).fill(l.weightGrams)),
  };
}
