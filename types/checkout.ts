export interface CartItem {
  productSlug: string;
  quantity: number;
  /** The options picked, e.g. { Size: "M", Color: "Black" }. */
  options?: Record<string, string>;
}

export interface Address {
  fullName: string;
  /** 10-digit Indian mobile number, without +91. */
  phone: string;
  houseNumber: string;
  area: string;
  landmark: string;
  /** 6-digit PIN code. */
  pincode: string;
  city: string;
  state: string;
}

export type PaymentMethod = "cod";

/** A snapshot of one product as it was ordered, so later catalogue changes don't alter it. */
export interface OrderLine {
  productSlug: string;
  title: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  /** The options ordered, e.g. { Size: "M", Color: "Black" }. */
  options?: Record<string, string>;
}

export type OrderStatus = "placed" | "cancelled";

export interface Order {
  id: string;
  status: OrderStatus;
  /** ISO date-time the order was placed. */
  placedAt: string;
  lines: OrderLine[];
  address: Address;
  paymentMethod: PaymentMethod;
  total: number;
  /** ISO date-time the order was cancelled, if it was. */
  cancelledAt?: string;
  /** True once the order has been delivered; the customer can then review its products. */
  isDelivered?: boolean;
}

/** The store's delivery charge rule, set in the admin. */
export interface DeliveryRule {
  /** Rupees per order. 0 is free delivery. */
  charge: number;
  /** Orders at or above this subtotal deliver free. 0 means there is no such minimum. */
  freeAbove: number;
}

export interface CheckoutState {
  cart: CartItem[];
  /** The saved delivery address, reused for the next order. */
  address: Address | null;
  paymentMethod: PaymentMethod;
  /** Every order the visitor's account has placed, newest first. */
  orders: Order[];
  delivery: DeliveryRule;
}
