"use client";

import { getSupabaseAdminBrowserClient } from "@/lib/supabase/client";

/** Signs the admin out of the admin only; any shop login in this browser is untouched. */
export async function adminSignOut(): Promise<void> {
  const { error } = await getSupabaseAdminBrowserClient().auth.signOut();
  if (error) throw new Error(error.message);
}
