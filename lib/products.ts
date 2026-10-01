import "server-only";

import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getDiscountPercent } from "@/lib/format";
import { toProduct } from "@/lib/supabase/mappers";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { Product } from "@/types";

// The only module that knows where products come from: the Supabase products table.
// Row level security returns only active listings to the shop. Pages using these are
// built statically; the admin revalidates them after a change.

const OLDEST_FIRST = ["created_at", { ascending: true }] as const;

function products() {
  return createSupabasePublicClient().from("products").select("*");
}

/** The rows of a successful query; throws if the query failed. */
function unwrap<T>(result: PostgrestSingleResponse<T>): T {
  if (!result.success) throw new Error(`Couldn't load products: ${result.error.message}`);
  return result.data;
}

export async function getProducts(): Promise<Product[]> {
  const rows = unwrap(await products().order(...OLDEST_FIRST));
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const row = unwrap(await products().eq("slug", slug).maybeSingle());
  return row ? toProduct(row) : undefined;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const rows = unwrap(
    await products()
      .eq("category_slug", categorySlug)
      .order(...OLDEST_FIRST),
  );
  return rows.map(toProduct);
}

export async function getTopPicks(): Promise<Product[]> {
  const rows = unwrap(
    await products()
      .eq("is_top_pick", true)
      .order(...OLDEST_FIRST),
  );
  return rows.map(toProduct);
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
  const all = await getProducts();
  return Object.fromEntries(
    prices.map((price) => [price, all.filter((product) => product.price <= price).length]),
  );
}

/** Other products from the same category, for the "More in ..." section of a product page. */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const rows = unwrap(
    await products()
      .eq("category_slug", product.categorySlug)
      .neq("slug", product.slug)
      .order(...OLDEST_FIRST)
      .limit(limit),
  );
  return rows.map(toProduct);
}
