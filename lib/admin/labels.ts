import type {
  AdminOrderStatus,
  CodPaymentStatus,
  ListingStatus,
  PayoutStatus,
  ReturnStatus,
} from "@/types";

/** The tone a status badge uses. Every badge also shows its label, never colour alone. */
export type StatusTone = "neutral" | "info" | "progress" | "good" | "warning" | "critical";

export interface StatusDisplay {
  label: string;
  tone: StatusTone;
}

export const ORDER_STATUSES: AdminOrderStatus[] = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export const orderStatusDisplay: Record<AdminOrderStatus, StatusDisplay> = {
  new: { label: "New", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "info" },
  shipped: { label: "Shipped", tone: "progress" },
  delivered: { label: "Delivered", tone: "good" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  returned: { label: "Returned", tone: "critical" },
};

/** The next step an order can move to, for the "move to" action on order screens. */
export const nextOrderStatus: Partial<Record<AdminOrderStatus, AdminOrderStatus>> = {
  new: "confirmed",
  confirmed: "shipped",
  shipped: "delivered",
};

export const paymentStatusDisplay: Record<CodPaymentStatus, StatusDisplay> = {
  pending: { label: "COD pending", tone: "warning" },
  collected: { label: "Collected", tone: "good" },
  refunded: { label: "Refunded", tone: "neutral" },
};

export const returnStatusDisplay: Record<ReturnStatus, StatusDisplay> = {
  requested: { label: "Requested", tone: "warning" },
  approved: { label: "Approved", tone: "info" },
  rejected: { label: "Rejected", tone: "neutral" },
  refunded: { label: "Refunded", tone: "good" },
};

export const listingStatusDisplay: Record<ListingStatus, StatusDisplay> = {
  active: { label: "Active", tone: "good" },
  draft: { label: "Draft", tone: "neutral" },
};

export const payoutStatusDisplay: Record<PayoutStatus, StatusDisplay> = {
  processing: { label: "Processing", tone: "warning" },
  paid: { label: "Paid", tone: "good" },
};

export type StockLevel = "in-stock" | "low" | "out";

export function getStockLevel(stock: number, lowStockThreshold: number): StockLevel {
  if (stock <= 0) return "out";
  return stock <= lowStockThreshold ? "low" : "in-stock";
}

export const stockLevelDisplay: Record<StockLevel, StatusDisplay> = {
  "in-stock": { label: "In stock", tone: "good" },
  low: { label: "Low stock", tone: "warning" },
  out: { label: "Out of stock", tone: "critical" },
};
