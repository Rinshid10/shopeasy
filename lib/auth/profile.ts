"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Address } from "@/types";

// The customer's own details on the profile screen, read and changed in the browser under
// their login (row-level security keeps it to their own rows).

export interface CustomerProfile {
  fullName: string;
  phone: string;
  email: string;
}

/** The logged-in customer's profile, or null when nobody is logged in. */
export async function getProfile(): Promise<CustomerProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: session } = await supabase.auth.getSession();
  const user = session.session?.user;
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("full_name, phone, email, contact_email")
    .eq("id", user.id)
    .maybeSingle();
  return {
    fullName: data?.full_name ?? "",
    phone: data?.phone ?? "",
    email: user.email ?? data?.email ?? data?.contact_email ?? "",
  };
}

/** Saves the customer's name and phone number. */
export async function updateProfile(fullName: string, phone: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data: session } = await supabase.auth.getSession();
  const user = session.session?.user;
  if (!user) throw new Error("Please log in again.");
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  // The greeting reads the name from the login itself.
  if (!user.is_anonymous) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }
}

/** The customer's saved delivery address, or null if they haven't ordered yet. */
export async function getDefaultAddress(): Promise<Address | null> {
  const { data } = await getSupabaseBrowserClient()
    .from("addresses")
    .select("*")
    .eq("is_default", true)
    .maybeSingle();
  if (!data) return null;
  return {
    fullName: data.full_name,
    phone: data.phone,
    houseNumber: data.house_number,
    area: data.area,
    landmark: data.landmark,
    pincode: data.pincode,
    city: data.city,
    state: data.state,
  };
}
