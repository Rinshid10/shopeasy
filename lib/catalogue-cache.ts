import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { toCategory, toProduct } from "@/lib/supabase/mappers";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/types";

/** Tag for the shop's catalogue cache; the admin expires it after every change. */
export const CATALOGUE_TAG = "catalogue";

interface Catalogue {
  /** Active products, oldest first. */
  products: Product[];
  categories: Category[];
}

/**
 * The whole shop catalogue in one round trip to Supabase, kept in Next.js' cache so pages
 * don't query the database on every visit. The admin refreshes it on save (updateTag); it
 * also refreshes itself every few minutes in case something changed elsewhere.
 */
const loadCatalogue = unstable_cache(
  async (): Promise<Catalogue> => {
    const supabase = createSupabasePublicClient();
    const [products, categories] = await Promise.all([
      supabase.from("products").select("*").order("created_at"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    if (products.error) throw new Error(`Couldn't load products: ${products.error.message}`);
    if (categories.error) {
      throw new Error(`Couldn't load categories: ${categories.error.message}`);
    }
    return {
      products: products.data.map(toProduct),
      categories: categories.data.map(toCategory),
    };
  },
  ["shop-catalogue-v1"],
  { tags: [CATALOGUE_TAG], revalidate: 300 },
);

/** The cached catalogue, read at most once per request. */
export const getCatalogue = cache(loadCatalogue);
