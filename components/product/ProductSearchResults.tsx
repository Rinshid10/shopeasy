"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/format";
import {
  parseMaxPrice,
  SEARCH_MAX_PRICE_PARAM,
  SEARCH_QUERY_PARAM,
  searchProducts,
} from "@/lib/product-search";
import { routes } from "@/lib/routes";
import type { Product } from "@/types";

interface ResultsProps {
  products: Product[];
}

interface ResultsViewProps extends ResultsProps {
  query: string;
  maxPrice?: number;
}

function describeResults(count: number, query: string, maxPrice?: number): string {
  const found = `${count} ${count === 1 ? "product" : "products"}`;
  const underPrice = maxPrice === undefined ? "" : ` under ${formatPrice(maxPrice)}`;
  if (query === "") {
    return maxPrice === undefined ? `Showing all ${found}.` : `${found}${underPrice}.`;
  }
  return `${found}${underPrice} ${count === 1 ? "matches" : "match"} “${query}”.`;
}

function ResultsView({ products, query, maxPrice }: ResultsViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <p aria-live="polite" className="text-sm font-medium text-ink-muted">
        {describeResults(products.length, query, maxPrice)}
      </p>
      <section aria-labelledby="search-results-heading">
        <h2 id="search-results-heading" className="sr-only">
          Search results
        </h2>
        {products.length > 0 ? (
          <ProductGrid products={products} eagerCount={4} />
        ) : (
          <Card className="flex flex-col items-start gap-3 p-6">
            <p className="text-ink">
              Try a different word or a brand name, or browse everything we have picked.
            </p>
            <ButtonLink href={routes.search}>Browse all products</ButtonLink>
          </Card>
        )}
      </section>
    </div>
  );
}

function FilteredResults({ products }: ResultsProps) {
  const searchParams = useSearchParams();
  const query = (searchParams.get(SEARCH_QUERY_PARAM) ?? "").trim();
  const maxPrice = parseMaxPrice(searchParams.get(SEARCH_MAX_PRICE_PARAM));
  return (
    <ResultsView
      products={searchProducts(products, query, maxPrice)}
      query={query}
      maxPrice={maxPrice}
    />
  );
}

/** Filters products in the browser using the query in the URL, so the page itself stays static. */
export function ProductSearchResults({ products }: ResultsProps) {
  return (
    <Suspense fallback={<ResultsView products={products} query="" />}>
      <FilteredResults products={products} />
    </Suspense>
  );
}
