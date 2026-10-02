import { supabaseUrl } from "@/lib/supabase/env";
import type { Category, CategoryTint, MeeshoRatings, Product, ProductSpec } from "@/types";
import type { Json } from "@/types/supabase";
import type { Tables } from "@/types/supabase";

export const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Turns a stored image path into a URL. Paths starting with "/" are files in public/ (the
 * demo pictures); anything else is an object in the product-images bucket.
 */
export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith("/") || imagePath.startsWith("http")) return imagePath;
  return `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${imagePath}`;
}

/** Reads stored product details, skipping anything that isn't a { label, value } pair. */
export function toSpecs(value: Json): ProductSpec[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    item &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    typeof item.label === "string" &&
    typeof item.value === "string"
      ? [{ label: item.label, value: item.value }]
      : [],
  );
}

/** Reads the Meesho rating and reviews stored on a product, if it has a rating. */
/** Most photos kept per Meesho review (Meesho allows more). */
export const MAX_REVIEW_IMAGES = 4;

/** A photo a buyer attached to a Meesho review, on Meesho's image server. */
export function isMeeshoReviewImage(url: unknown): url is string {
  return (
    typeof url === "string" && url.startsWith("https://images.meesho.com/images/ratings_reviews/")
  );
}

export function toMeeshoRatings(
  row: Pick<
    Tables<"products">,
    | "meesho_rating"
    | "meesho_rating_count"
    | "meesho_review_count"
    | "meesho_star_counts"
    | "meesho_url"
    | "meesho_reviews"
  >,
): MeeshoRatings | undefined {
  if (row.meesho_rating === null) return undefined;
  const reviews = Array.isArray(row.meesho_reviews) ? row.meesho_reviews : [];
  return {
    rating: Number(row.meesho_rating),
    ratingCount: row.meesho_rating_count ?? undefined,
    reviewCount: row.meesho_review_count ?? undefined,
    starCounts: row.meesho_star_counts?.length === 5 ? row.meesho_star_counts : undefined,
    url: row.meesho_url ?? undefined,
    reviews: reviews.flatMap((item) =>
      item && typeof item === "object" && !Array.isArray(item) && typeof item.rating === "number"
        ? [
            {
              rating: item.rating,
              name: typeof item.name === "string" ? item.name : undefined,
              comment: typeof item.comment === "string" ? item.comment : "",
              images: Array.isArray(item.images)
                ? item.images.filter(isMeeshoReviewImage).slice(0, MAX_REVIEW_IMAGES)
                : undefined,
              date: typeof item.date === "string" ? item.date : "",
            },
          ]
        : [],
    ),
  };
}

export function toProduct(row: Tables<"products">): Product {
  return {
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    categorySlug: row.category_slug,
    shortDescription: row.short_description,
    description: row.description,
    price: row.price,
    mrp: row.mrp ?? undefined,
    rating: row.rating ?? undefined,
    ratingCount: row.rating_count ?? undefined,
    imageUrl: getImageUrl(row.image_path),
    extraImageUrls: row.extra_image_paths.flatMap((path) => getImageUrl(path) ?? []),
    specs: toSpecs(row.specs),
    meesho: toMeeshoRatings(row),
    pros: row.pros,
    cons: row.cons,
    isTopPick: row.is_top_pick,
  };
}

export function toCategory(row: Tables<"categories">): Category {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: getImageUrl(row.image_path),
    tint: row.tint as CategoryTint,
  };
}
