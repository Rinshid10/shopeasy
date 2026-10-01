import type { JwtPayload } from "@supabase/supabase-js";

/**
 * Admins have role "admin" in app_metadata, which only the server can set. Never check
 * user_metadata for this: visitors can edit it.
 */
export function isAdminClaims(claims: JwtPayload | null | undefined): boolean {
  const appMetadata = claims?.app_metadata as { role?: unknown } | undefined;
  return appMetadata?.role === "admin";
}
