import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { adminCookieOptions, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

/**
 * A Supabase client acting as the signed-in admin (from the admin's own login cookie), for
 * Server Components and Server Actions. Create one per request. Reading cookies makes the
 * page dynamic.
 */
export async function createSupabaseAdminServerClient() {
  return createCookieClient(adminCookieOptions);
}

/**
 * A Supabase client acting as the shop customer (from the shop's login cookie), for Server
 * Actions the shop calls, such as saving a review.
 */
export async function createSupabaseShopServerClient() {
  return createCookieClient();
}

async function createCookieClient(cookieOptions?: typeof adminCookieOptions) {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies. The proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * A Supabase client with no visitor session, for public reads such as the catalogue. It
 * doesn't touch cookies, so pages that only use it can stay static.
 */
export function createSupabasePublicClient() {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
