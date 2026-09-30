import type { Product } from "@/types";

export const productSortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type ProductSort = (typeof productSortOptions)[number]["value"];

export function isProductSort(value: string): value is ProductSort {
  return productSortOptions.some((option) => option.value === value);
}

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  switch (sort) {
    case "price-asc":
      return [...products].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...products].sort((a, b) => b.price - a.price);
    case "featured":
      return products;
  }
}
