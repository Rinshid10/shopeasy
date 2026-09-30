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

const countFormatter = new Intl.NumberFormat(siteConfig.locale, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Shortens a large count for display, e.g. 12400 -> "12.4K". */
export function formatCount(count: number): string {
  return countFormatter.format(count);
}

/** Formats a rupee amount with Indian digit grouping, e.g. 125000 -> "₹1,25,000". */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

/** The whole-number percentage saved against the MRP, or null when there is no discount. */
export function getDiscountPercent(price: number, mrp: number | undefined): number | null {
  if (mrp === undefined || mrp <= price) {
    return null;
  }
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Formats an ISO date (YYYY-MM-DD) for display, e.g. "30 September 2026". */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
