import { siteConfig } from "@/lib/site-config";
import type { CartItem, DeliveryRule, Product } from "@/types";

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface PriceSummary {
  /** Total of the MRPs (or prices, where there is no MRP). */
  totalMrp: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  itemCount: number;
}

/** Pairs cart items with their products, skipping any product no longer in the catalogue. */
export function getCartLines(cart: CartItem[], products: Product[]): CartLine[] {
  return cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.slug === item.productSlug);
    return product ? [{ product, quantity: item.quantity }] : [];
  });
}

/** Works out the delivery charge the same way the database does when placing the order. */
export function getDeliveryCharge(subtotal: number, rule: DeliveryRule): number {
  return rule.freeAbove > 0 && subtotal >= rule.freeAbove ? 0 : rule.charge;
}

export function getPriceSummary(lines: CartLine[], delivery: DeliveryRule): PriceSummary {
  const totalMrp = lines.reduce(
    (sum, { product, quantity }) => sum + (product.mrp ?? product.price) * quantity,
    0,
  );
  const subtotal = lines.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const deliveryCharge = lines.length > 0 ? getDeliveryCharge(subtotal, delivery) : 0;

  return {
    totalMrp,
    discount: totalMrp - subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
    itemCount: lines.reduce((sum, { quantity }) => sum + quantity, 0),
  };
}

/** The latest date the order is expected to arrive, based on the store's delivery estimate. */
export function getExpectedDeliveryDate(placedAt: string): Date {
  const date = new Date(placedAt);
  date.setDate(date.getDate() + siteConfig.store.deliveryDays.max);
  return date;
}
