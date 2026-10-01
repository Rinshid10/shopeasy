import "server-only";

import { toCategory } from "@/lib/supabase/mappers";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await createSupabasePublicClient()
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(`Couldn't load categories: ${error.message}`);
  return data.map(toCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const { data, error } = await createSupabasePublicClient()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Couldn't load categories: ${error.message}`);
  return data ? toCategory(data) : undefined;
}
