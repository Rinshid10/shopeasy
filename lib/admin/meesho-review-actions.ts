"use server";

import type { ActionResult } from "@/lib/admin/actions";
import { checkApifyRun, MeeshoImportError, startApifyRun } from "@/lib/admin/meesho-apify";
import { requireAdmin } from "@/lib/admin/session";
import { isMeeshoReviewImage, MAX_REVIEW_IMAGES } from "@/lib/supabase/mappers";

// What buyers say about the product on Meesho: their rating, names, comments and photos.
// The admin form attaches the result to the product, to show labelled on its page. Uses
// Apify's "Meesho Products & Reviews Scraper", which finds the product by searching Meesho
// for its name, so the match can be a close relative.

const REVIEWS_ACTOR = "krazee_kaushik~meesho-search-results-scraper";
/** The scraper's minimum is 6; 20 gives a fair picture for about 2 cents. */
const REVIEWS_TO_FETCH = 20;

interface ScrapedReview {
  author?: { name?: string };
  rating?: number;
  comments?: string;
  created?: string;
  helpful_count?: number;
  media?: { url?: string; type?: string }[];
}

interface ScrapedProduct {
  name?: string;
  slug?: string;
  product_id?: string;
  catalog_reviews_summary?: { average_rating?: number; rating_count?: number };
  reviews?: ScrapedReview[];
}

export interface MeeshoReviewResearch {
  /** The Meesho product the search matched, to judge how close it is. */
  matchedName: string;
  matchedUrl: string | null;
  averageRating: number | null;
  ratingCount: number | null;
  /** Buyers' reviews without their names. */
  reviews: {
    name: string;
    rating: number;
    comment: string;
    date: string;
    helpful: number;
    images: string[];
  }[];
}

function toFailure(error: unknown): { ok: false; error: string } {
  if (error instanceof MeeshoImportError) return { ok: false, error: error.message };
  console.error("[meesho reviews]", error);
  return { ok: false, error: "Something went wrong. Try again." };
}

/** Starts looking up Meesho reviews for a product name; returns an id to check on. */
export async function startMeeshoReviewResearch(
  productName: string,
): Promise<ActionResult<{ runId: string }>> {
  await requireAdmin();
  const search = productName.trim().slice(0, 150);
  if (search.length < 3) return { ok: false, error: "Enter the product name to search for." };
  try {
    const runId = await startApifyRun(REVIEWS_ACTOR, {
      searchTexts: [search],
      productsPerSearch: 1,
      includeReviews: true,
      reviewsPerProduct: REVIEWS_TO_FETCH,
    });
    return { ok: true, data: { runId } };
  } catch (error) {
    return toFailure(error);
  }
}

export type MeeshoReviewCheck =
  { status: "running" } | { status: "done"; research: MeeshoReviewResearch };

export async function checkMeeshoReviewResearch(
  runId: string,
): Promise<ActionResult<MeeshoReviewCheck>> {
  await requireAdmin();
  try {
    const result = await checkApifyRun<ScrapedProduct>(runId, 1);
    if (result.status === "running") return { ok: true, data: { status: "running" } };
    if (result.status === "failed") return { ok: false, error: result.error };

    const product = result.items[0];
    if (!product?.name) {
      return { ok: false, error: "No matching product found on Meesho. Try a shorter name." };
    }
    return {
      ok: true,
      data: {
        status: "done",
        research: {
          matchedName: product.name,
          matchedUrl:
            product.slug && product.product_id
              ? `https://www.meesho.com/${product.slug}/p/${product.product_id}`
              : null,
          averageRating: product.catalog_reviews_summary?.average_rating ?? null,
          ratingCount: product.catalog_reviews_summary?.rating_count ?? null,
          reviews: (product.reviews ?? [])
            .filter((review) => typeof review.rating === "number")
            .map((review) => ({
              rating: review.rating ?? 0,
              name: review.author?.name?.trim() || "Meesho User",
              comment: (review.comments ?? "").trim(),
              date: review.created ?? "",
              helpful: review.helpful_count ?? 0,
              images: (review.media ?? [])
                .filter((media) => media.type === "image" && isMeeshoReviewImage(media.url))
                .map((media) => media.url!)
                .slice(0, MAX_REVIEW_IMAGES),
            })),
        },
      },
    };
  } catch (error) {
    return toFailure(error);
  }
}
