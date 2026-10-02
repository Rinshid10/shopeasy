import { getExpectedDeliveryDate } from "@/lib/checkout/pricing";
import { siteConfig } from "@/lib/site-config";
import type { Order } from "@/types";

const shortDateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** E.g. "Thu, 8 Oct". */
export function formatShortDate(date: Date | string): string {
  return shortDateFormatter.format(new Date(date));
}

/** E.g. "1 Oct 2026, 4:30 pm". */
export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date));
}

/** One line describing where the order is, e.g. "Arriving by Thu, 8 Oct". */
export function describeOrderStatus(order: Order): string {
  if (order.status === "cancelled") {
    return order.cancelledAt ? `Cancelled on ${formatShortDate(order.cancelledAt)}` : "Cancelled";
  }
  if (order.isDelivered) {
    return "Delivered";
  }
  return `Arriving by ${formatShortDate(getExpectedDeliveryDate(order.placedAt))}`;
}
