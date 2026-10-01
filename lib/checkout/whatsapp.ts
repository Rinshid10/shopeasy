import { formatAddressLine } from "@/lib/checkout/address";
import { formatDateTime, formatShortDate } from "@/lib/checkout/order-dates";
import { getExpectedDeliveryDate } from "@/lib/checkout/pricing";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";
import type { Order } from "@/types";

const INDIA_COUNTRY_CODE = "91";

/** The order's page on the site the shopper is using, so the link works on any domain. */
function getOrderPageUrl(orderId: string): string {
  return new URL(routes.orderDetails(orderId), window.location.origin).toString();
}

/**
 * The order details as a WhatsApp message (*asterisks* make text bold there).
 * Call it in the browser only, since the order link uses the current site address.
 */
export function buildOrderMessage(order: Order): string {
  const items = order.lines.map(
    (line) => `• ${line.title} × ${line.quantity} - ${formatPrice(line.price * line.quantity)}`,
  );
  const { address } = order;

  return [
    `*${siteConfig.name} order confirmed* ✅`,
    "",
    `*Order ID:* ${order.id}`,
    `*Placed on:* ${formatDateTime(order.placedAt)}`,
    "",
    "*Items*",
    ...items,
    "",
    `*Total:* ${formatPrice(order.total)} (Cash on Delivery)`,
    `*Expected delivery by:* ${formatShortDate(getExpectedDeliveryDate(order.placedAt))}`,
    "",
    "*Delivering to*",
    address.fullName,
    formatAddressLine(address),
    `+${INDIA_COUNTRY_CODE} ${address.phone}`,
    "",
    `View your order: ${getOrderPageUrl(order.id)}`,
  ].join("\n");
}

/**
 * A link that opens WhatsApp on a chat with the order's phone number, with the order
 * details typed in ready to send. Sending to your own number saves it in your own chat.
 */
export function getOrderWhatsAppUrl(order: Order): string {
  const message = encodeURIComponent(buildOrderMessage(order));
  return `https://wa.me/${INDIA_COUNTRY_CODE}${order.address.phone}?text=${message}`;
}
