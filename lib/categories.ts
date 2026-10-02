import "server-only";

import { getCatalogue } from "@/lib/catalogue-cache";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  return (await getCatalogue()).categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((category) => category.slug === slug);
}
