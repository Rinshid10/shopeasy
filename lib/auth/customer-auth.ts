"use client";

import type { User } from "@supabase/supabase-js";

import { getCheckoutSnapshot, mergeIntoCart } from "@/lib/checkout/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Customers log in or register with email and password. Browsing and filling the cart work
// without an account (as an anonymous guest); buying needs one. Whatever the guest put in
// the cart moves into the account they log in to.

/** The admin account is kept apart from the shop: it can't log in or buy here. */
function isAdminUser(user: User): boolean {
  return user.app_metadata?.role === "admin";
}

/** True for a customer with a real account; false for guests, visitors and the admin. */
export function hasAccount(user: User | null): boolean {
  return Boolean(user && !user.is_anonymous && !isAdminUser(user));
}

function friendlyMessage(error: { message: string; code?: string; status?: number }): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Wrong email or password.";
    case "email_not_confirmed":
      return "Confirm your email first: open the link we sent you, then log in.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Log in instead.";
    case "weak_password":
      return "Choose a stronger password (at least 6 characters).";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many tries. Please wait a minute and try again.";
    default:
      return error.message;
  }
}

/** The guest's cart, so it can follow them into the account. */
function takeGuestCart() {
  return getCheckoutSnapshot()?.cart ?? [];
}

export async function logIn(email: string, password: string): Promise<void> {
  const guestCart = takeGuestCart();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendlyMessage(error));
  if (isAdminUser(data.user)) {
    await supabase.auth.signOut({ scope: "local" });
    throw new Error("This is the admin account. Please use a customer account to shop.");
  }
  await mergeIntoCart(guestCart);
}

export type RegisterResult = "signed-in" | "confirm-email";

/**
 * Creates an account. If the project asks new customers to confirm their email, they are not
 * signed in yet and must open the link first ("confirm-email").
 */
export async function register(
  fullName: string,
  email: string,
  password: string,
): Promise<RegisterResult> {
  const guestCart = takeGuestCart();
  const { data, error } = await getSupabaseBrowserClient().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/account`,
    },
  });
  if (error) throw new Error(friendlyMessage(error));
  // Supabase hides whether an email is taken: an existing address comes back with no identities.
  if (data.user && data.user.identities?.length === 0) {
    throw new Error(friendlyMessage({ message: "", code: "user_already_exists" }));
  }
  if (!data.session) return "confirm-email";
  await mergeIntoCart(guestCart);
  return "signed-in";
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseBrowserClient().auth.signOut();
  if (error) throw new Error(error.message);
}
