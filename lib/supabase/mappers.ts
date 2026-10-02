import { supabaseUrl } from "@/lib/supabase/env";
import type { Category, CategoryTint, Product, ProductSpec } from "@/types";
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
