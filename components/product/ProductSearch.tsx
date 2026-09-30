"use client";

import { useId, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchIcon } from "@/components/ui/icons";
import { searchProducts } from "@/lib/product-search";
import type { Product } from "@/types";

interface ProductSearchProps {
  products: Product[];
}

function describeResults(count: number, query: string): string {
  if (query === "") {
    return `Showing all ${count} products.`;
  }
  if (count === 0) {
    return `No products match “${query}”. Try a different word or a brand name.`;
  }
  return `${count} ${count === 1 ? "product matches" : "products match"} “${query}”.`;
}

export function ProductSearch({ products }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const trimmedQuery = query.trim();
  const results = searchProducts(products, trimmedQuery);

  return (
    <div className="flex flex-col gap-4">
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor={inputId} className="sr-only">
          Search products
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product or brand"
            autoComplete="off"
            className="min-h-12 w-full rounded-lg border border-line bg-surface pr-3 pl-10 text-base text-ink placeholder:text-ink-muted"
          />
        </div>
      </form>
      <p aria-live="polite" className="text-sm text-ink-muted">
        {describeResults(results.length, trimmedQuery)}
      </p>
      <section aria-labelledby="search-results-heading">
        <h2 id="search-results-heading" className="sr-only">
          Search results
        </h2>
        <ProductGrid products={results} />
      </section>
    </div>
  );
}
