"use client";

import { useSyncExternalStore } from "react";
import type { ProductOption, SelectedOptions } from "@/lib/product-options";

// The options picked on a product page (Size, Color, …), shared by the option chips and the
// Buy Now buttons (the main one and the phone's sticky bar). Kept per product, so they're
// still there if the shopper comes back to the product.

/** The id of the product page's options box, so Buy Now can bring it into view. */
export const SELECT_OPTIONS_ID = "select-options";

interface OptionSelection {
  /** Options picked per product slug. */
  picked: Record<string, SelectedOptions>;
  /** Quantity chosen per product slug; 1 when not set. */
  quantities: Record<string, number>;
  /** The product whose Buy Now was tapped with options missing, to show what's needed. */
  missingFor: string | null;
}

let selection: OptionSelection = { picked: {}, quantities: {}, missingFor: null };
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => selection;

/** Picks a value for one of a product's options, e.g. Size "M". */
export function selectOption(productSlug: string, optionName: string, value: string) {
  selection = {
    ...selection,
    picked: {
      ...selection.picked,
      [productSlug]: { ...selection.picked[productSlug], [optionName]: value },
    },
  };
  for (const listener of listeners) listener();
}

/** Asks the shopper to finish picking: shows what's missing and brings the box into view. */
export function requestOptions(productSlug: string) {
  selection = { ...selection, missingFor: productSlug };
  for (const listener of listeners) listener();
  const box = document.getElementById(SELECT_OPTIONS_ID);
  box?.scrollIntoView({ block: "center" });
  box?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
}

/**
 * The options picked for a product, and which are still missing. An option with only one
 * value (e.g. Size "Free Size") is picked already.
 */
export function useSelectedOptions(productSlug: string, options: readonly ProductOption[]) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const picked = state.picked[productSlug] ?? {};
  const selected: SelectedOptions = {};
  const missing: string[] = [];
  for (const option of options) {
    const value = picked[option.name];
    if (value && option.values.includes(value)) selected[option.name] = value;
    else if (option.values.length === 1) selected[option.name] = option.values[0];
    else missing.push(option.name);
  }
  return { selected, missing, isAsked: state.missingFor === productSlug };
}

/** Sets how many of a product to buy. */
export function selectQuantity(productSlug: string, quantity: number) {
  selection = { ...selection, quantities: { ...selection.quantities, [productSlug]: quantity } };
  for (const listener of listeners) listener();
}

/** How many of a product the shopper chose to buy. */
export function useSelectedQuantity(productSlug: string): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).quantities[productSlug] ?? 1;
}
