import "server-only";

import { unstable_cache } from "next/cache";

import { createSupabasePublicClient } from "@/lib/supabase/server";

/** Tag for the reviews cache; saving or hiding a review expires it. */
export const REVIEWS_TAG = "reviews";

/** How many reviews the product page can list (5 at first, the rest after "View all"). */
const LATEST_COUNT = 50;

export interface ProductReview {
  id: string;
  /** E.g. "Priya S.". */
  reviewerName: string;
  rating: number;
  comment: string;
  /** ISO date-time. */
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  /** How many reviews gave each star rating, 5 down to 1. */
  countsByStars: Record<1 | 2 | 3 | 4 | 5, number>;
  /** The newest reviews that have a written comment. */
  latest: ProductReview[];
}

/** A product's visible customer reviews, summarised for the product page. Cached. */
export const getReviewSummary = unstable_cache(
  async (productSlug: string): Promise<ReviewSummary> => {
    const { data, error } = await createSupabasePublicClient()
      .from("product_reviews")
      .select("id, reviewer_name, rating, comment, created_at, products!inner(slug)")
      .eq("products.slug", productSlug)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Couldn't load reviews: ${error.message}`);

    const countsByStars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of data) countsByStars[row.rating as 1 | 2 | 3 | 4 | 5] += 1;
    const total = data.reduce((sum, row) => sum + row.rating, 0);

    return {
      average: data.length ? Math.round((total / data.length) * 10) / 10 : 0,
      count: data.length,
      countsByStars,
      latest: data
        .filter((row) => row.comment.trim() !== "")
        .slice(0, LATEST_COUNT)
        .map((row) => ({
          id: row.id,
          reviewerName: row.reviewer_name,
          rating: row.rating,
          comment: row.comment,
          createdAt: row.created_at,
        })),
    };
  },
  ["product-reviews-v1"],
  { tags: [REVIEWS_TAG], revalidate: 300 },
);
