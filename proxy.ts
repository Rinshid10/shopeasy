import { NextResponse, type NextRequest } from "next/server";

import { isAdminClaims } from "@/lib/auth/roles";
import { updateSession } from "@/lib/supabase/proxy";

// Keeps the Supabase session fresh on the pages that read it on the server, and turns
// non-admins away from /admin early. The admin layout and every admin Server Action check
// the role again, so this is only the first gate.
export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (isAdminArea && !isAdminClaims(claims)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}

export const config = {
  // Shop pages read the session in the browser, so the proxy only runs for the admin.
  matcher: ["/admin/:path*"],
};
