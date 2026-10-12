"use client";

import type { User } from "@supabase/supabase-js";

import { carryOverSelection, getCheckoutSnapshot } from "@/lib/checkout/store";
import { carryOverWishlist, getWishlistSlugs } from "@/lib/wishlist";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CartItem } from "@/types";

// Customers log in with Google. Browsing and filling the cart work without an account (as an
// anonymous guest); placing an order needs one. The guest's cart and wishlist move into the
// account when they log in.

/** The admin account is kept apart from the shop: it can't log in or buy here. */
function isAdminUser(user: User): boolean {
  return user.app_metadata?.role === "admin";
}

/** True for a customer with a real account; false for guests, visitors and the admin. */
export function hasAccount(user: User | null): boolean {
  return Boolean(user && !user.is_anonymous && !isAdminUser(user));
}

/** Where the guest's cart and wishlist wait while Google logs them in on another page. */
const GOOGLE_LOGIN_KEY = "shopeasy-google-login";

type GoogleLoginStash = { cart: CartItem[]; wishlist: string[] };

/**
 * Sends the customer to Google to log in. They come back through /auth/callback to the
 * account page, which calls finishGoogleLogin() to bring their guest cart and wishlist along.
 */
export async function signInWithGoogle(returnTo?: string): Promise<void> {
  const stash: GoogleLoginStash = {
    cart: getCheckoutSnapshot()?.cart ?? [],
    wishlist: getWishlistSlugs(),
  };
  try {
    sessionStorage.setItem(GOOGLE_LOGIN_KEY, JSON.stringify(stash));
  } catch {
    // Private mode or blocked storage: the login still works, the guest cart is just not kept.
  }

  const callback = new URL("/auth/callback", window.location.origin);
  if (returnTo) callback.searchParams.set("next", returnTo);
  const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });
  if (error) throw new Error(error.message);
}

/** True while a Google login is in progress: the customer has left for Google and come back. */
export function isGoogleLoginPending(): boolean {
  try {
    return sessionStorage.getItem(GOOGLE_LOGIN_KEY) !== null;
  } catch {
    return false;
  }
}

/** Forgets the guest cart kept for a Google login that didn't finish. */
export function cancelGoogleLogin(): void {
  try {
    sessionStorage.removeItem(GOOGLE_LOGIN_KEY);
  } catch {
    // Nothing to forget.
  }
}

/** After a Google login, carries the guest's cart and wishlist into the account. */
export async function finishGoogleLogin(): Promise<void> {
  let stash: GoogleLoginStash | null = null;
  try {
    const raw = sessionStorage.getItem(GOOGLE_LOGIN_KEY);
    sessionStorage.removeItem(GOOGLE_LOGIN_KEY);
    if (raw) stash = JSON.parse(raw) as GoogleLoginStash;
  } catch {
    stash = null;
  }
  if (!stash) return;
  await carryOverSelection(stash.cart);
  await carryOverWishlist(stash.wishlist);
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
  if (error) throw new Error(error.message);
}
