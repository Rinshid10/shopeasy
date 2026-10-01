import { getImageUrl } from "@/lib/supabase/mappers";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site-config";
import type { Address, CartItem, CheckoutState, Order, OrderStatus, PaymentMethod } from "@/types";
import type { Tables } from "@/types/supabase";

// The cart, saved address and orders live in Supabase, under the visitor's account. Visitors
// get an anonymous account the first time they add to the cart, so nobody has to sign up to
// shop; they can attach an email later to keep their history.
//
// Components read an in-memory copy through useCheckout(). Changes show at once and are then
// written to the database in order; if a write fails, the copy is reloaded from the database.

/** Where the cart and address lived before Supabase. Moved to the account once, then removed. */
const LEGACY_STORAGE_KEY = "shopeasy-checkout-v1";

const EMPTY_STATE: CheckoutState = {
  cart: [],
  address: null,
  paymentMethod: "cod",
  orders: [],
  delivery: { charge: siteConfig.store.deliveryCharge, freeAbove: 0 },
};

let currentState: CheckoutState | null = null;
let savedAddressId: string | null = null;
let loadStarted = false;
let lastLoadedAt = 0;
let writeQueue: Promise<unknown> = Promise.resolve();
const productIds = new Map<string, string>();
const listeners = new Set<() => void>();

function supabase() {
  return getSupabaseBrowserClient();
}

function setState(next: CheckoutState) {
  currentState = next;
  listeners.forEach((listener) => listener());
}

function updateState(change: (state: CheckoutState) => CheckoutState) {
  setState(change(currentState ?? EMPTY_STATE));
}

/** Runs database writes one after another, so they land in the order the shopper made them. */
function enqueue<T>(write: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(write);
  writeQueue = result.catch((error: unknown) => {
    console.error("[checkout] Couldn't save a change; reloading.", error);
    void reload();
  });
  return result;
}

/** The signed-in user's id, signing in as a guest first if needed. */
async function requireUserId(): Promise<string> {
  const { data } = await supabase().auth.getSession();
  if (data.session) return data.session.user.id;

  const { data: signedIn, error } = await supabase().auth.signInAnonymously();
  if (error || !signedIn.user) {
    throw new Error(`Couldn't start a guest session: ${error?.message ?? "no user"}`);
  }
  return signedIn.user.id;
}

async function getProductIds(slugs: string[]): Promise<Map<string, string>> {
  const missing = slugs.filter((slug) => !productIds.has(slug));
  if (missing.length > 0) {
    const { data, error } = await supabase()
      .from("products")
      .select("id, slug")
      .in("slug", missing);
    if (error) throw error;
    for (const { id, slug } of data) productIds.set(slug, id);
  }
  return productIds;
}

async function getProductId(slug: string): Promise<string> {
  const id = (await getProductIds([slug])).get(slug);
  if (!id) throw new Error(`Product ${slug} is no longer available`);
  return id;
}

function clampQuantity(quantity: number): number {
  return Math.min(Math.max(Math.round(quantity), 1), siteConfig.store.maxQuantityPerItem);
}

function toAddress(row: Tables<"addresses">): Address {
  return {
    fullName: row.full_name,
    phone: row.phone,
    houseNumber: row.house_number,
    area: row.area,
    landmark: row.landmark,
    pincode: row.pincode,
    city: row.city,
    state: row.state,
  };
}

function toAddressRow(address: Address) {
  return {
    full_name: address.fullName,
    phone: address.phone,
    house_number: address.houseNumber,
    area: address.area,
    landmark: address.landmark,
    pincode: address.pincode,
    city: address.city,
    state: address.state,
  };
}

/** The shop shows an order as placed until it is cancelled or returned. */
function toOrderStatus(status: string): OrderStatus {
  return status === "cancelled" || status === "returned" ? "cancelled" : "placed";
}

type OrderRow = Tables<"orders"> & { order_items: Tables<"order_items">[] };

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    status: toOrderStatus(row.status),
    placedAt: row.placed_at,
    lines: [...row.order_items]
      .sort((a, b) => a.id - b.id)
      .map((item) => ({
        productSlug: item.product_slug,
        title: item.title,
        imageUrl: getImageUrl(item.image_path),
        price: item.price,
        quantity: item.quantity,
      })),
    address: row.address as unknown as Address,
    paymentMethod: "cod",
    total: row.total,
    cancelledAt: row.cancelled_at ?? undefined,
  };
}

async function fetchDeliveryRule(): Promise<CheckoutState["delivery"]> {
  const { data, error } = await supabase()
    .from("store_settings")
    .select("delivery_charge, free_delivery_above")
    .maybeSingle();
  if (error || !data) return EMPTY_STATE.delivery;
  return { charge: data.delivery_charge, freeAbove: data.free_delivery_above };
}

/** Reads the cart, default address and orders of the signed-in visitor. */
async function fetchState(): Promise<CheckoutState> {
  const [{ data: session }, delivery] = await Promise.all([
    supabase().auth.getSession(),
    fetchDeliveryRule(),
  ]);
  if (!session.session) {
    savedAddressId = null;
    return { ...EMPTY_STATE, delivery };
  }

  const [cart, address, orders] = await Promise.all([
    supabase().from("cart_items").select("quantity, products(id, slug)").order("added_at"),
    supabase().from("addresses").select("*").eq("is_default", true).maybeSingle(),
    supabase().from("orders").select("*, order_items(*)").order("placed_at", { ascending: false }),
  ]);
  if (cart.error) throw cart.error;
  if (address.error) throw address.error;
  if (orders.error) throw orders.error;

  savedAddressId = address.data?.id ?? null;
  const cartItems: CartItem[] = cart.data.flatMap(({ quantity, products }) => {
    if (!products) return [];
    productIds.set(products.slug, products.id);
    return [{ productSlug: products.slug, quantity }];
  });

  return {
    cart: cartItems,
    address: address.data ? toAddress(address.data) : null,
    paymentMethod: "cod",
    orders: (orders.data as OrderRow[]).map(toOrder),
    delivery,
  };
}

async function reload() {
  try {
    lastLoadedAt = Date.now();
    setState(await fetchState());
  } catch (error) {
    console.error("[checkout] Couldn't load the cart and orders.", error);
    if (!currentState) setState(EMPTY_STATE);
  }
}

/** Moves a cart and address saved in this browser before Supabase into the account, once. */
async function moveLegacyState() {
  let saved: { cart?: CartItem[]; address?: Address | null } | null = null;
  try {
    saved = JSON.parse(window.localStorage.getItem(LEGACY_STORAGE_KEY) ?? "null");
  } catch {
    // Damaged or blocked storage: nothing to move.
  }
  if (!saved) return;

  const cart = Array.isArray(saved.cart)
    ? saved.cart.filter((item) => typeof item?.productSlug === "string" && item.quantity > 0)
    : [];
  if (cart.length > 0 || saved.address) {
    const userId = await requireUserId();
    if (cart.length > 0) {
      const ids = await getProductIds(cart.map((item) => item.productSlug));
      const rows = cart.flatMap((item) => {
        const productId = ids.get(item.productSlug);
        return productId
          ? [{ user_id: userId, product_id: productId, quantity: clampQuantity(item.quantity) }]
          : [];
      });
      const { error } = await supabase()
        .from("cart_items")
        .upsert(rows, { onConflict: "user_id,product_id" });
      if (error) throw error;
    }
    if (saved.address) {
      const { error } = await supabase().from("addresses").insert(toAddressRow(saved.address));
      if (error) console.error("[checkout] Couldn't move the saved address.", error);
    }
  }
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore: worst case the move is tried again and the upsert keeps it harmless.
  }
}

function startLoading() {
  if (loadStarted) return;
  loadStarted = true;

  void (async () => {
    try {
      await moveLegacyState();
    } catch (error) {
      console.error("[checkout] Couldn't move the saved cart.", error);
    }
    await reload();
  })();

  // Reload when the visitor signs in or out, here or in another tab. The callback must not
  // await Supabase calls itself, so the reload runs on the next tick.
  supabase().auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
      setTimeout(() => void reload(), 0);
    }
  });

  // Pick up changes made elsewhere (another tab, or the store updating an order).
  window.addEventListener("focus", () => {
    if (Date.now() - lastLoadedAt > 30_000) void reload();
  });
}

/** The current state, or null until it has loaded from Supabase. */
export function getCheckoutSnapshot(): CheckoutState | null {
  return currentState;
}

/** On the server and during hydration there is no saved state yet. */
export function getServerCheckoutSnapshot(): null {
  return null;
}

export function subscribeToCheckout(listener: () => void): () => void {
  listeners.add(listener);
  startLoading();
  return () => {
    listeners.delete(listener);
  };
}

async function writeCartQuantity(productSlug: string, quantity: number) {
  const userId = await requireUserId();
  const productId = await getProductId(productSlug);
  const { error } = await supabase()
    .from("cart_items")
    .upsert(
      { user_id: userId, product_id: productId, quantity },
      { onConflict: "user_id,product_id" },
    );
  if (error) throw error;
}

/** Adds one of a product to the cart, or one more if it is already there. */
export function addToCart(productSlug: string) {
  const existing = currentState?.cart.find((item) => item.productSlug === productSlug);
  const quantity = existing ? clampQuantity(existing.quantity + 1) : 1;
  updateState((state) => ({
    ...state,
    cart: existing
      ? state.cart.map((item) => (item.productSlug === productSlug ? { ...item, quantity } : item))
      : [...state.cart, { productSlug, quantity }],
  }));
  void enqueue(() => writeCartQuantity(productSlug, quantity));
}

/** Puts a product in the cart for "Buy now" without adding a second one if it is already there. */
export function ensureInCart(productSlug: string) {
  if (!currentState?.cart.some((item) => item.productSlug === productSlug)) {
    addToCart(productSlug);
  }
}

/**
 * Adds a guest cart to the signed-in account's cart after signing in to an existing account,
 * keeping the larger quantity where both have the same product.
 */
export async function mergeIntoCart(items: CartItem[]): Promise<void> {
  if (items.length === 0) return;
  await enqueue(async () => {
    const userId = await requireUserId();
    const ids = await getProductIds(items.map((item) => item.productSlug));
    const { data: existing, error: readError } = await supabase()
      .from("cart_items")
      .select("product_id, quantity");
    if (readError) throw readError;

    const rows = items.flatMap((item) => {
      const productId = ids.get(item.productSlug);
      if (!productId) return [];
      const current = existing.find((row) => row.product_id === productId)?.quantity ?? 0;
      return [
        {
          user_id: userId,
          product_id: productId,
          quantity: clampQuantity(Math.max(current, item.quantity)),
        },
      ];
    });
    const { error } = await supabase()
      .from("cart_items")
      .upsert(rows, { onConflict: "user_id,product_id" });
    if (error) throw error;
  });
  await reload();
}

export function setCartQuantity(productSlug: string, quantity: number) {
  const clamped = clampQuantity(quantity);
  updateState((state) => ({
    ...state,
    cart: state.cart.map((item) =>
      item.productSlug === productSlug ? { ...item, quantity: clamped } : item,
    ),
  }));
  void enqueue(() => writeCartQuantity(productSlug, clamped));
}

export function removeFromCart(productSlug: string) {
  updateState((state) => ({
    ...state,
    cart: state.cart.filter((item) => item.productSlug !== productSlug),
  }));
  void enqueue(async () => {
    const productId = await getProductId(productSlug);
    const { error } = await supabase().from("cart_items").delete().eq("product_id", productId);
    if (error) throw error;
  });
}

/** Saves the delivery address as the visitor's default, for this and later orders. */
export function saveAddress(address: Address) {
  updateState((state) => ({ ...state, address }));
  void enqueue(async () => {
    await requireUserId();
    if (savedAddressId) {
      const { error } = await supabase()
        .from("addresses")
        .update(toAddressRow(address))
        .eq("id", savedAddressId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase()
        .from("addresses")
        .insert(toAddressRow(address))
        .select("id")
        .single();
      if (error) throw error;
      savedAddressId = data.id;
    }
  });
}

export function setPaymentMethod(paymentMethod: PaymentMethod) {
  updateState((state) => ({ ...state, paymentMethod }));
}

/**
 * Places an order from the cart and the saved address. The database works out the prices,
 * checks stock and empties the cart. Resolves with the new order.
 */
export async function placeOrder(): Promise<Order> {
  // Let any cart or address changes still on their way finish first.
  await writeQueue;
  if (!savedAddressId) throw new Error("Add a delivery address first.");

  const { data: orderId, error } = await supabase().rpc("place_order", {
    p_address_id: savedAddressId,
  });
  if (error) throw new Error(error.message);

  await reload();
  const order = currentState?.orders.find((candidate) => candidate.id === orderId);
  if (!order) throw new Error("The order was placed but couldn't be loaded.");
  return order;
}

/** Cancels an order that hasn't shipped yet. Rejects with a readable message if it can't. */
export async function cancelOrder(orderId: string): Promise<void> {
  const { error } = await supabase().rpc("cancel_order", { p_order_id: orderId });
  if (error) {
    await reload();
    throw new Error(error.message);
  }
  await reload();
}
