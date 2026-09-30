import "server-only";

import { categories } from "@/data/categories";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return categories.find((category) => category.slug === slug);
}
