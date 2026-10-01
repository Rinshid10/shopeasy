import { createBrowserClient } from "@supabase/ssr";

import { adminCookieOptions, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;
let adminBrowserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** The shop's Supabase client for Client Components; the customer's session lives in cookies. */
export function getSupabaseBrowserClient() {
  browserClient ??= createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
  return browserClient;
}

/** The admin's Supabase client, signed in separately from the shop (own cookie). */
export function getSupabaseAdminBrowserClient() {
  adminBrowserClient ??= createBrowserClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookieOptions: adminCookieOptions,
  });
  return adminBrowserClient;
}
