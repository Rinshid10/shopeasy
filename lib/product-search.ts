import type { Product } from "@/types";

/** The URL parameter that carries the search query, e.g. /search?q=power+bank. */
export const SEARCH_QUERY_PARAM = "q";

/** Returns the products whose title, brand or descriptions contain every word in the query. */
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return products;
  }

  return products.filter((product) => {
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
