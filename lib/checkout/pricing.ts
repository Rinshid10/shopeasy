import { siteConfig } from "@/lib/site-config";
import type { Address, CartItem, Order, Product } from "@/types";

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

export function getPriceSummary(lines: CartLine[]): PriceSummary {
  const totalMrp = lines.reduce(
    (sum, { product, quantity }) => sum + (product.mrp ?? product.price) * quantity,
    0,
  );
  const subtotal = lines.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const deliveryCharge = lines.length > 0 ? siteConfig.store.deliveryCharge : 0;

  return {
    totalMrp,
    discount: totalMrp - subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
    itemCount: lines.reduce((sum, { quantity }) => sum + quantity, 0),
  };
}

function createOrderId(): string {
  const random = Math.floor(Math.random() * 1296)
    .toString(36)
    .padStart(2, "0");
  return `SE${Date.now().toString(36)}${random}`.toUpperCase();
}

export function createOrder(lines: CartLine[], address: Address): Order {
  return {
    id: createOrderId(),
    status: "placed",
    placedAt: new Date().toISOString(),
    lines: lines.map(({ product, quantity }) => ({
      productSlug: product.slug,
      title: product.title,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity,
    })),
    address,
    paymentMethod: "cod",
    total: getPriceSummary(lines).total,
  };
}

/** The latest date the order is expected to arrive, based on the store's delivery estimate. */
export function getExpectedDeliveryDate(placedAt: string): Date {
  const date = new Date(placedAt);
  date.setDate(date.getDate() + siteConfig.store.deliveryDays.max);
  return date;
}
