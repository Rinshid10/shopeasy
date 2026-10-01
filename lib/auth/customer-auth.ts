"use client";

import type { User } from "@supabase/supabase-js";

import { getCheckoutSnapshot, mergeIntoCart } from "@/lib/checkout/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Customers log in with their mobile number and a 6-digit code sent by SMS. The first login
// creates the account, so there is no separate registration. Browsing and filling the cart
// work without an account (as an anonymous guest); buying needs one. Whatever the guest put
// in the cart moves into the account they log in to.

const INDIA_COUNTRY_CODE = "+91";

/** The admin account is kept apart from the shop: it can't log in or buy here. */
function isAdminUser(user: User): boolean {
  return user.app_metadata?.role === "admin";
}

/** True for a customer with a real account; false for guests, visitors and the admin. */
export function hasAccount(user: User | null): boolean {
  return Boolean(user && !user.is_anonymous && !isAdminUser(user));
}

/** "9876543210" → "+919876543210", the format Supabase stores. */
function toInternational(mobile: string): string {
  return `${INDIA_COUNTRY_CODE}${mobile}`;
}

/** "919876543210" (as Supabase returns it) → "+91 98765 43210", for display. */
export function formatMobile(phone: string | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : (phone ?? "");
}

function friendlyMessage(error: { message: string; code?: string; status?: number }): string {
  switch (error.code) {
    case "otp_expired":
      return "That code is wrong or has expired. Check it, or send a new one.";
    case "phone_provider_disabled":
    case "sms_send_failed":
      return "We couldn't send the SMS right now. Please try again later.";
    case "over_sms_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many codes sent. Please wait a minute and try again.";
    default:
      return error.message;
  }
}

/** Sends a 6-digit login code by SMS to a 10-digit Indian mobile number. */
export async function sendLoginCode(mobile: string): Promise<void> {
  const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({
    phone: toInternational(mobile),
  });
  if (error) throw new Error(friendlyMessage(error));
}

/** Checks the code and logs the customer in, bringing their guest cart along. */
export async function verifyLoginCode(mobile: string, code: string): Promise<void> {
  const guestCart = getCheckoutSnapshot()?.cart ?? [];
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: toInternational(mobile),
    token: code,
    type: "sms",
  });
  if (error) throw new Error(friendlyMessage(error));
  if (data.user && isAdminUser(data.user)) {
    await supabase.auth.signOut({ scope: "local" });
    throw new Error("This number belongs to the admin account. Please use another number.");
  }
  await mergeIntoCart(guestCart);
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
  if (error) throw new Error(error.message);
}
