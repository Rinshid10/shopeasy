import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { DEFAULT_THEME_KEY, getTheme, type Theme } from "@/lib/themes";

/** Tag for the shop-wide settings cache; the admin expires it on every settings save. */
export const STORE_SETTINGS_TAG = "store-settings";

/** The site's colour theme, as picked in the admin. Cached until the settings change. */
export const getStoreTheme = unstable_cache(
  async (): Promise<Theme> => {
    const { data } = await createSupabasePublicClient()
      .from("store_settings")
      .select("theme")
      .maybeSingle();
    return getTheme(data?.theme ?? DEFAULT_THEME_KEY);
  },
  ["store-theme-v1"],
  { tags: [STORE_SETTINGS_TAG], revalidate: 300 },
);
