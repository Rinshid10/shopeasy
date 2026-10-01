export interface CartItem {
  productSlug: string;
  quantity: number;
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
}

export interface CheckoutState {
  cart: CartItem[];
  /** The saved delivery address, reused for the next order. */
  address: Address | null;
  paymentMethod: PaymentMethod;
  /** Every order placed from this browser, newest first. */
  orders: Order[];
}
