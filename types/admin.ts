import type { Address, OrderLine } from "./checkout";

/** An order's journey as the store sees it, from arrival to delivery (or the exits). */
export type AdminOrderStatus =
  "new" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";

export type CodPaymentStatus = "pending" | "collected" | "refunded";

export interface AdminOrderEvent {
  status: AdminOrderStatus;
  /** ISO date-time. */
  at: string;
}

export interface AdminOrder {
  id: string;
  /** ISO date-time. */
  placedAt: string;
  status: AdminOrderStatus;
  customerId: string;
  /** The name and email the customer gave (account email, or guest details). */
  customerName: string;
  customerEmail: string | null;
  address: Address;
  lines: OrderLine[];
  /** Delivery charge in rupees, included in the total. */
  deliveryCharge: number;
  total: number;
  paymentMethod: "cod";
  paymentStatus: CodPaymentStatus;
  /** Every status change so far, oldest first. */
  timeline: AdminOrderEvent[];
}

export type ListingStatus = "active" | "draft";

/** Stock and listing details the store keeps for each catalogue product. */
export interface ProductInventory {
  productSlug: string;
  sku: string;
  stock: number;
  /** At or below this many in stock, the product is flagged as running low. */
  lowStockThreshold: number;
  listingStatus: ListingStatus;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  /** ISO date the customer first ordered. */
  joinedAt: string;
}

export type CouponType = "percent" | "flat";

export interface Coupon {
  code: string;
  description: string;
  type: CouponType;
  /** Percent off for "percent", rupees off for "flat". */
  value: number;
  minOrderValue: number;
  usageCount: number;
  usageLimit?: number;
  /** ISO date, if the coupon expires. */
  expiresAt?: string;
  isActive: boolean;
}

export type ReturnStatus = "requested" | "approved" | "rejected" | "refunded";

export interface ReturnRequest {
  id: string;
  orderId: string;
  productSlug: string;
  productTitle: string;
  customerId: string;
  reason: string;
  /** ISO date-time. */
  requestedAt: string;
  status: ReturnStatus;
  amount: number;
}

export type PayoutStatus = "processing" | "paid";

/** Cash collected by the courier for a week's delivered orders, paid on to the store. */
export interface Payout {
  id: string;
  /** ISO dates. */
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  amount: number;
  status: PayoutStatus;
  /** ISO date, once paid. */
  paidAt?: string;
}

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  isCodEnabled: boolean;
  codLimit: number;
  returnWindowDays: number;
}
