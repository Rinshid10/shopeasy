"use server";

import { updateTag } from "next/cache";

import { CATALOGUE_TAG } from "@/lib/catalogue-cache";
import { REVIEWS_TAG } from "@/lib/reviews";
import { createSupabaseShopServerClient } from "@/lib/supabase/server";

// Customers rate and review products from their delivered orders. The database checks that
// the order is theirs and delivered; this only shapes the request and refreshes the shop.

export type ReviewResult = { ok: true } | { ok: false; error: string };

const MAX_COMMENT_LENGTH = 1000;

interface SubmitReviewInput {
  orderId: string;
  productSlug: string;
  rating: number;
  comment: string;
}

/** Saves the customer's review of one product from one order, or updates it if it exists. */
export async function submitReview({
  orderId,
  productSlug,
  rating,
  comment,
}: SubmitReviewInput): Promise<ReviewResult> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Choose from 1 to 5 stars." };
  }
  const text = comment.trim().slice(0, MAX_COMMENT_LENGTH);

  const supabase = await createSupabaseShopServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", productSlug)
    .maybeSingle();
  if (!product) return { ok: false, error: "This product is no longer in the shop." };

  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("order_id", orderId)
    .eq("product_id", product.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("product_reviews").update({ rating, comment: text }).eq("id", existing.id)
    : await supabase
        .from("product_reviews")
        .insert({ order_id: orderId, product_id: product.id, rating, comment: text });
  if (error) {
    return {
      ok: false,
      error:
        error.code === "42501"
          ? "You can review a product once its order has been delivered."
          : "Couldn't save your review. Please try again.",
    };
  }

  updateTag(REVIEWS_TAG);
  updateTag(CATALOGUE_TAG);
  return { ok: true };
}
