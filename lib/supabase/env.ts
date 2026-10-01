// The Supabase project URL and publishable key. Both are public: the publishable key only
// grants what the database's row level security policies allow.

export const supabaseUrl = requireEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
export const supabasePublishableKey = requireEnv(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not set. Copy .env.example to .env.local and fill it in.`);
  }
  return value;
}

/**
 * The admin keeps its own login cookie, separate from the shop's, so being signed in to the
 * admin never signs anyone in to the shop, and the other way round.
 */
export const adminCookieOptions = { name: "sb-shopeasy-admin-auth" } as const;
