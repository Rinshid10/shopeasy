import { siteConfig } from "./site-config";

const priceFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  dateStyle: "long",
  timeZone: "UTC",
});

/** Formats a rupee amount with Indian digit grouping, e.g. 125000 -> "₹1,25,000". */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

/** Formats an ISO date (YYYY-MM-DD) for display, e.g. "30 September 2026". */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
