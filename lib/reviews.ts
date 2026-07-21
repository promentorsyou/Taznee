/**
 * Product review reads. Only APPROVED reviews are ever returned — there is
 * no seeded/placeholder review data, so a brand-new store correctly shows
 * an empty state and no aggregate rating until real, moderated reviews
 * exist.
 */
import { prisma } from "@/lib/prisma";

export interface ReviewView {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  verifiedPurchase: boolean;
  createdAt: Date;
}

export interface ReviewSummary {
  count: number;
  /** Mean rating, rounded to one decimal. */
  average: number;
}

export async function getApprovedReviews(productId: string): Promise<ReviewView[]> {
  const rows = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    authorName: r.user.name ?? "Verified customer",
    verifiedPurchase: r.verifiedPurchase,
    createdAt: r.createdAt,
  }));
}

export function summarizeReviews(reviews: ReviewView[]): ReviewSummary | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { count: reviews.length, average: Math.round((total / reviews.length) * 10) / 10 };
}
