import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/lib/routes";
import { createSupabaseShopServerClient } from "@/lib/supabase/server";

/**
 * Where Google sends the customer back after they log in. Turns the one-time code into a
 * session (kept in the shop's cookie), then returns to the account page, which carries the
 * guest's cart over and continues to `next` (e.g. checkout).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = searchParams.get("next");
  const accountUrl = new URL(routes.account, publicOrigin(request));
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    accountUrl.searchParams.set("next", next);
  }

  const code = searchParams.get("code");
  if (!code) {
    accountUrl.searchParams.set("error", "google");
    return NextResponse.redirect(accountUrl);
  }

  const supabase = await createSupabaseShopServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    accountUrl.searchParams.set("error", "google");
    return NextResponse.redirect(accountUrl);
  }

  // The admin account is kept apart from the shop: it can't log in or buy here.
  if (data.user.app_metadata?.role === "admin") {
    await supabase.auth.signOut({ scope: "local" });
    accountUrl.searchParams.set("error", "admin");
  }

  return NextResponse.redirect(accountUrl);
}

/** The site's public origin, also behind a hosting proxy (e.g. Netlify). */
function publicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost && process.env.NODE_ENV === "production") {
    return `https://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}
