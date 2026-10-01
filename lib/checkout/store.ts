import { siteConfig } from "@/lib/site-config";
import type { Address, CartItem, CheckoutState, Order, PaymentMethod } from "@/types";

// The cart, saved address and order history live in the visitor's browser (localStorage).
// To move orders to a backend, keep these functions and send the order in placeOrder.

const STORAGE_KEY = "shopeasy-checkout-v1";

const EMPTY_STATE: CheckoutState = {
  cart: [],
  address: null,
  paymentMethod: "cod",
  orders: [],
};

let currentState: CheckoutState | null = null;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCartItem(value: unknown): value is CartItem {
  return (
    isRecord(value) &&
    typeof value.productSlug === "string" &&
    typeof value.quantity === "number" &&
    value.quantity > 0
  );
}

/** Reads saved orders; older saves kept only the latest order, without a status. */
function readOrders(saved: Record<string, unknown>): Order[] {
  const orders = Array.isArray(saved.orders)
    ? saved.orders
    : isRecord(saved.lastOrder)
      ? [saved.lastOrder]
      : [];
  return orders
    .filter(
      (order): order is Record<string, unknown> => isRecord(order) && typeof order.id === "string",
    )
    .map((order) => ({ status: "placed", ...order }) as unknown as Order);
}

/** Reads the saved state, falling back to an empty one if it is missing or damaged. */
function readStoredState(): CheckoutState {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!isRecord(parsed)) {
      return EMPTY_STATE;
    }
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart.filter(isCartItem) : [],
      address: isRecord(parsed.address) ? (parsed.address as unknown as Address) : null,
      paymentMethod: "cod",
      orders: readOrders(parsed),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function updateState(change: (state: CheckoutState) => CheckoutState) {
  currentState = change(getCheckoutSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch {
    // Storage can be full or blocked (private mode). The state still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

function clampQuantity(quantity: number): number {
  return Math.min(Math.max(Math.round(quantity), 1), siteConfig.store.maxQuantityPerItem);
}

export function getCheckoutSnapshot(): CheckoutState {
  currentState ??= readStoredState();
  return currentState;
}

/** On the server and during hydration there is no saved state yet. */
export function getServerCheckoutSnapshot(): null {
  return null;
}

export function subscribeToCheckout(listener: () => void): () => void {
  // Keep several open tabs in step with each other.
  function syncFromOtherTab(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      currentState = readStoredState();
      listener();
    }
  }

  listeners.add(listener);
  window.addEventListener("storage", syncFromOtherTab);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", syncFromOtherTab);
  };
}

/** Adds one of a product to the cart, or one more if it is already there. */
export function addToCart(productSlug: string) {
  updateState((state) => {
    const existing = state.cart.find((item) => item.productSlug === productSlug);
    const cart = existing
      ? state.cart.map((item) =>
          item === existing ? { ...item, quantity: clampQuantity(item.quantity + 1) } : item,
        )
      : [...state.cart, { productSlug, quantity: 1 }];
    return { ...state, cart };
  });
}

/** Puts a product in the cart for "Buy now" without adding a second one if it is already there. */
export function ensureInCart(productSlug: string) {
  if (!getCheckoutSnapshot().cart.some((item) => item.productSlug === productSlug)) {
    addToCart(productSlug);
  }
}

export function setCartQuantity(productSlug: string, quantity: number) {
  updateState((state) => ({
    ...state,
    cart: state.cart.map((item) =>
      item.productSlug === productSlug ? { ...item, quantity: clampQuantity(quantity) } : item,
    ),
  }));
}

export function removeFromCart(productSlug: string) {
  updateState((state) => ({
    ...state,
    cart: state.cart.filter((item) => item.productSlug !== productSlug),
  }));
}

export function saveAddress(address: Address) {
  updateState((state) => ({ ...state, address }));
}

export function setPaymentMethod(paymentMethod: PaymentMethod) {
  updateState((state) => ({ ...state, paymentMethod }));
}

/** Adds the order to the history and empties the cart. */
export function placeOrder(order: Order) {
  updateState((state) => ({ ...state, cart: [], orders: [order, ...state.orders] }));
}

export function cancelOrder(orderId: string) {
  const cancelledAt = new Date().toISOString();
  updateState((state) => ({
    ...state,
    orders: state.orders.map((order) =>
      order.id === orderId && order.status === "placed"
        ? { ...order, status: "cancelled", cancelledAt }
        : order,
    ),
  }));
}
