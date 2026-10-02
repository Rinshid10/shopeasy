"use client";

import { useSyncExternalStore } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// The products a shopper hearted, kept in Supabase (wishlist_items). Hearting works without
// logging in: like Buy Now, the first heart starts a guest account, and logging in brings the
// guest's hearts along.

interface WishlistState {
  /** Hearted product slugs, newest first. */
  slugs: string[];
  isLoaded: boolean;
}

let state: WishlistState = { slugs: [], isLoaded: false };
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;
let isWatchingAuth = false;

function setState(next: WishlistState) {
  state = next;
  for (const listener of listeners) listener();
}

const supabase = () => getSupabaseBrowserClient();

async function load(): Promise<void> {
  const { data: session } = await supabase().auth.getSession();
  if (!session.session) {
    setState({ slugs: [], isLoaded: true });
    return;
  }
  const { data, error } = await supabase()
    .from("wishlist_items")
    .select("products(slug)")
    .order("added_at", { ascending: false });
  if (error) {
    console.error("[wishlist] Couldn't load the wishlist.", error);
    setState({ ...state, isLoaded: true });
    return;
  }
  setState({
    slugs: data.flatMap((row) => (row.products ? [row.products.slug] : [])),
    isLoaded: true,
  });
}

function ensureLoaded() {
  if (!isWatchingAuth) {
    isWatchingAuth = true;
    // Logging in or out changes whose wishlist it is.
    supabase().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void load();
    });
  }
  loading ??= load();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureLoaded();
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const serverSnapshot: WishlistState = { slugs: [], isLoaded: false };

/** The hearted product slugs, newest first. */
export function useWishlist(): WishlistState {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

async function userId(): Promise<string> {
  const { data } = await supabase().auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: signedIn, error } = await supabase().auth.signInAnonymously();
  if (error || !signedIn.user) throw error ?? new Error("Couldn't start a guest session.");
  return signedIn.user.id;
}

async function productIdOf(slug: string): Promise<string> {
  const { data, error } = await supabase().from("products").select("id").eq("slug", slug).single();
  if (error) throw error;
  return data.id;
}

/** Hearts or un-hearts a product. The heart changes at once; saving follows. */
export async function toggleWishlist(slug: string): Promise<void> {
  const wasHearted = state.slugs.includes(slug);
  setState({
    ...state,
    slugs: wasHearted ? state.slugs.filter((item) => item !== slug) : [slug, ...state.slugs],
  });
  try {
    const [user, productId] = await Promise.all([userId(), productIdOf(slug)]);
    const { error } = wasHearted
      ? await supabase()
          .from("wishlist_items")
          .delete()
          .eq("user_id", user)
          .eq("product_id", productId)
      : await supabase()
          .from("wishlist_items")
          .upsert({ user_id: user, product_id: productId }, { ignoreDuplicates: true });
    if (error) throw error;
  } catch (error) {
    console.error("[wishlist] Couldn't save the change.", error);
    void load();
  }
}

/** The guest's hearted products, to carry over when they log in. */
export function getWishlistSlugs(): string[] {
  return state.slugs;
}

/** After logging in, adds the guest's hearted products to the account's wishlist. */
export async function carryOverWishlist(slugs: string[]): Promise<void> {
  if (slugs.length > 0) {
    const user = await userId();
    const { data: products } = await supabase().from("products").select("id").in("slug", slugs);
    if (products && products.length > 0) {
      await supabase()
        .from("wishlist_items")
        .upsert(
          products.map((product) => ({ user_id: user, product_id: product.id })),
          { ignoreDuplicates: true },
        );
    }
  }
  await load();
}
