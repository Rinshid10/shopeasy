import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { isAdminClaims } from "@/lib/auth/roles";
import { routes } from "@/lib/routes";
import { createSupabaseAdminServerClient } from "@/lib/supabase/server";

/**
 * A Supabase client signed in as the admin, plus their email. Sends anyone else to the
 * admin login. Every admin page and Server Action calls this; the database's RLS policies
 * check the admin role again on each query.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createSupabaseAdminServerClient();
  const { data } = await supabase.auth.getClaims();
  if (!isAdminClaims(data?.claims)) {
    redirect(routes.admin.login);
  }
  return { supabase, email: (data?.claims.email as string | undefined) ?? "" };
});
