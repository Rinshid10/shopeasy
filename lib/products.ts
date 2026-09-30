import "server-only";

import { products } from "@/data/products";
import type { Product } from "@/types";

// The only module that knows where products come from. To move to a database or the
// Flipkart Affiliate API, change these function bodies and keep the signatures.

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((product) => product.slug === slug);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return products.filter((product) => product.categorySlug === categorySlug);
}

export async function getTopPicks(): Promise<Product[]> {
  return products.filter((product) => product.isTopPick);
}

/** Other products from the same category, for the "More in ..." section of a product page. */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return products
    .filter(
      (candidate) =>
        candidate.categorySlug === product.categorySlug && candidate.slug !== product.slug,
    )
    .slice(0, limit);
}
