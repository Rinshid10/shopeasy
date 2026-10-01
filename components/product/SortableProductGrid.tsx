"use client";

import { useId, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  isProductSort,
  productSortOptions,
  sortProducts,
  type ProductSort,
} from "@/lib/product-sort";
import type { Product } from "@/types";

interface SortableProductGridProps {
  products: Product[];
}

export function SortableProductGrid({ products }: SortableProductGridProps) {
  const [sort, setSort] = useState<ProductSort>("featured");
  const selectId = useId();

  function handleSortChange(value: string) {
    if (isProductSort(value)) {
      setSort(value);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="text-sm font-medium text-ink">
            Sort by
          </label>
          <select
            id={selectId}
            value={sort}
            onChange={(event) => handleSortChange(event.target.value)}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink"
          >
            {productSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ProductGrid products={sortProducts(products, sort)} eagerCount={4} />
    </div>
  );
}
