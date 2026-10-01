"use client";

import { useSyncExternalStore } from "react";
import type { CheckoutState } from "@/types";
import { getCheckoutSnapshot, getServerCheckoutSnapshot, subscribeToCheckout } from "./store";

/**
 * The visitor's cart, address and last order. Returns null until the saved state has been
 * read in the browser, so components can show a placeholder instead of an empty cart.
 */
export function useCheckout(): CheckoutState | null {
  return useSyncExternalStore(subscribeToCheckout, getCheckoutSnapshot, getServerCheckoutSnapshot);
}
