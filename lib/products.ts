import "server-only";

import { getCatalogue } from "@/lib/catalogue-cache";
import { getDiscountPercent } from "@/lib/format";
import type { Product } from "@/types";

// The only module that knows where products come from: the Supabase products table, read
// through the shared catalogue cache (lib/catalogue-cache.ts) so pages stay fast. Row level
// security returns only active listings to the shop.

export async function getProducts(): Promise<Product[]> {
  return (await getCatalogue()).products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((product) => product.slug === slug);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return (await getProducts()).filter((product) => product.categorySlug === categorySlug);
}

export async function getTopPicks(): Promise<Product[]> {
  return (await getProducts()).filter((product) => product.isTopPick);
}

/** The products with the largest discount off their MRP, biggest first. */
export async function getBiggestDiscounts(limit = 10): Promise<Product[]> {
  return (await getProducts())
    .map((product) => ({ product, discount: getDiscountPercent(product.price, product.mrp) ?? 0 }))
    .filter(({ discount }) => discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit)
    .map(({ product }) => product);
}

/** How many products are priced at or below each of the given prices. */
export async function countProductsUnder(prices: number[]): Promise<Record<number, number>> {
  const products = await getProducts();
  return Object.fromEntries(
    prices.map((price) => [price, products.filter((product) => product.price <= price).length]),
  );
}

/** Other products from the same category, for the "More in ..." section of a product page. */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return (await getProducts())
    .filter(
      (candidate) =>
        candidate.categorySlug === product.categorySlug && candidate.slug !== product.slug,
    )
    .slice(0, limit);
}
