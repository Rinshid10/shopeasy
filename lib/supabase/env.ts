// The Supabase project URL and publishable key. Both are public: the publishable key only
// grants what the database's row level security policies allow. Environment variables win
// when set (e.g. on Netlify); otherwise the ShopEasy project's values are used, so a build
// never fails just because they weren't configured.

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kodjfjxztmjbjgcuyetn.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_egNWd0JefbuloyButXzOqA_7BHgTkiN";

/**
 * The admin keeps its own login cookie, separate from the shop's, so being signed in to the
 * admin never signs anyone in to the shop, and the other way round.
 */
export const adminCookieOptions = { name: "sb-shopeasy-admin-auth" } as const;
