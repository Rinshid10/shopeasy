import type { Product } from "@/types";

/** The URL parameter that carries the search query, e.g. /search?q=power+bank. */
export const SEARCH_QUERY_PARAM = "q";

/** The URL parameter that limits results to a price, e.g. /search?maxPrice=499. */
export const SEARCH_MAX_PRICE_PARAM = "maxPrice";

/** Reads a positive whole-rupee price from the URL, ignoring anything else. */
export function parseMaxPrice(value: string | null): number | undefined {
  const price = Number(value);
  return Number.isInteger(price) && price > 0 ? price : undefined;
}

/**
 * Returns the products whose title, brand or descriptions contain every word in the query,
 * priced at or below maxPrice when one is given.
 */
export function searchProducts(products: Product[], query: string, maxPrice?: number): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return products.filter((product) => {
    if (maxPrice !== undefined && product.price > maxPrice) {
      return false;
    }
    const searchableText = [
      product.title,
      product.brand,
      product.shortDescription,
      product.description,
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => searchableText.includes(term));
  });
}
