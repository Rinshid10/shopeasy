"use client";

import type { CheckoutState, Product } from "@/types";
import { getCartLines, getPriceSummary, type CartLine, type PriceSummary } from "./pricing";
import { useCheckout } from "./use-checkout";

export interface CartView {
  checkout: CheckoutState;
  lines: CartLine[];
  summary: PriceSummary;
}

/** The cart joined with product details and totals, or null until the saved cart has loaded. */
export function useCartView(products: Product[]): CartView | null {
  const checkout = useCheckout();
  if (!checkout) {
    return null;
  }

  const lines = getCartLines(checkout.cart, products);
  return { checkout, lines, summary: getPriceSummary(lines, checkout.delivery) };
}
