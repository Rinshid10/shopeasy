"use client";

import type { User } from "@supabase/supabase-js";

import { carryOverSelection, getCheckoutSnapshot } from "@/lib/checkout/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Customers log in with their name and email, then type the code we email them. No password;
// the first login creates the account. Browsing and filling the cart work without an account
// (as an anonymous guest); buying needs one. The guest's cart moves into the account.
//
// Supabase's email templates ("Confirm signup" and "Magic Link") must include {{ .Token }} so
// the email shows the code.

/** The admin account is kept apart from the shop: it can't log in or buy here. */
function isAdminUser(user: User): boolean {
  return user.app_metadata?.role === "admin";
}

/** True for a customer with a real account; false for guests, visitors and the admin. */
export function hasAccount(user: User | null): boolean {
  return Boolean(user && !user.is_anonymous && !isAdminUser(user));
}

function friendlyMessage(error: { message: string; code?: string }): string {
  switch (error.code) {
    case "otp_expired":
      return "That code is wrong or has expired. Check it, or send a new one.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many codes sent. Please wait a few minutes and try again.";
    default:
      return error.message;
  }
}

/** True when the email couldn't be sent for reasons on our side (limit reached, mail down). */
function isEmailUnavailable(error: { code?: string; status?: number }): boolean {
  return (
    error.code === "over_email_send_rate_limit" ||
    error.status === 429 ||
    (error.status !== undefined && error.status >= 500)
  );
}

/**
 * Emails a login code; new customers get an account with this name. Resolves with
 * "email-unavailable" when the code can't be sent right now, so checkout can fall back to
 * guest details instead.
 */
export async function sendLoginCode(
  fullName: string,
  email: string,
): Promise<"code-sent" | "email-unavailable"> {
  const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, data: { full_name: fullName } },
  });
  if (!error) return "code-sent";
  if (isEmailUnavailable(error)) return "email-unavailable";
  throw new Error(friendlyMessage(error));
}

/**
 * Lets a customer buy as a guest with their name and email, after checking the email looks
 * real. Used only when the login code can't be sent. Orders stay on this device.
 */
export async function continueAsGuest(fullName: string, email: string): Promise<void> {
  const response = await fetch("/api/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const check = (await response.json()) as { ok: boolean; reason?: string };
  if (!check.ok) throw new Error(check.reason ?? "Enter a valid email address.");

  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  let userId = data.session?.user.id;
  if (!userId) {
    const { data: signedIn, error } = await supabase.auth.signInAnonymously();
    if (error || !signedIn.user) throw new Error("Couldn't continue. Please try again.");
    userId = signedIn.user.id;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, contact_email: email })
    .eq("id", userId);
  if (error) throw new Error("Couldn't save your details. Please try again.");
  guestDetailsCache.set(userId, { fullName, email });
}

type GuestDetails = { fullName: string; email: string };

/** Guest details already read this visit, so checkout steps don't ask Supabase again. */
const guestDetailsCache = new Map<string, GuestDetails | null>();

/** The guest's name and email, if they gave them at checkout. */
export async function getGuestDetails(userId: string): Promise<GuestDetails | null> {
  const known = guestDetailsCache.get(userId);
  if (known !== undefined) return known;
  const { data } = await getSupabaseBrowserClient()
    .from("profiles")
    .select("full_name, contact_email")
    .eq("id", userId)
    .maybeSingle();
  const details =
    data?.full_name && data.contact_email
      ? { fullName: data.full_name, email: data.contact_email }
      : null;
  guestDetailsCache.set(userId, details);
  return details;
}

/** Checks the emailed code and logs the customer in, bringing their guest cart along. */
export async function verifyLoginCode(
  fullName: string,
  email: string,
  code: string,
): Promise<void> {
  const guestCart = getCheckoutSnapshot()?.cart ?? [];
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  if (error) throw new Error(friendlyMessage(error));
  if (!data.user) throw new Error("Couldn't log in. Please try again.");
  if (isAdminUser(data.user)) {
    await supabase.auth.signOut({ scope: "local" });
    throw new Error("This is the admin account. Please use a customer email to shop.");
  }

  // Keep the name the customer typed this time on their profile.
  await supabase.from("profiles").update({ full_name: fullName }).eq("id", data.user.id);
  await carryOverSelection(guestCart);
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
  if (error) throw new Error(error.message);
}
