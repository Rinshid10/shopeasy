import type { AdminOrder, AdminOrderStatus } from "@/types";

const DAY_MS = 86_400_000;

/** Orders that count as sales: everything except cancelled and returned ones. */
export function isSale(order: AdminOrder): boolean {
  return order.status !== "cancelled" && order.status !== "returned";
}

function ordersBetween(orders: AdminOrder[], from: number, to: number): AdminOrder[] {
  return orders.filter((order) => {
    const placed = Date.parse(order.placedAt);
    return placed > from && placed <= to;
  });
}

export interface PeriodTotals {
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  cancelledCount: number;
}

function totalsFor(orders: AdminOrder[]): PeriodTotals {
  const sales = orders.filter(isSale);
  const revenue = sales.reduce((sum, order) => sum + order.total, 0);
  return {
    revenue,
    orderCount: sales.length,
    averageOrderValue: sales.length > 0 ? Math.round(revenue / sales.length) : 0,
    cancelledCount: orders.filter((order) => order.status === "cancelled").length,
  };
}

export interface PeriodComparison {
  current: PeriodTotals;
  previous: PeriodTotals;
}

/** Totals for the last `days` days, and for the same length of time before that. */
export function comparePeriods(orders: AdminOrder[], now: string, days: number): PeriodComparison {
  const end = Date.parse(now);
  const start = end - days * DAY_MS;
  return {
    current: totalsFor(ordersBetween(orders, start, end)),
    previous: totalsFor(ordersBetween(orders, start - days * DAY_MS, start)),
  };
}

/** Percentage change from previous to current, or null when there is nothing to compare with. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export interface DailySales {
  /** ISO date (YYYY-MM-DD), in India time. */
  date: string;
  revenue: number;
  orderCount: number;
}

const indiaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });

/** Revenue and order count for each of the last `days` days, oldest first. */
export function dailySales(orders: AdminOrder[], now: string, days: number): DailySales[] {
  const end = Date.parse(now);
  const series = Array.from({ length: days }, (_, index) => ({
    date: indiaDate.format(new Date(end - (days - 1 - index) * DAY_MS)),
    revenue: 0,
    orderCount: 0,
  }));

  for (const order of orders.filter(isSale)) {
    const day = series.find((entry) => entry.date === indiaDate.format(new Date(order.placedAt)));
    if (day) {
      day.revenue += order.total;
      day.orderCount += 1;
    }
  }
  return series;
}

export function countByStatus(orders: AdminOrder[]): Record<AdminOrderStatus, number> {
  const counts: Record<AdminOrderStatus, number> = {
    new: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  };
  for (const order of orders) {
    counts[order.status] += 1;
  }
  return counts;
}

export interface ProductSales {
  productSlug: string;
  title: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
}

/** The best-selling products by revenue, from sales only. */
export function topProducts(orders: AdminOrder[], limit = 5): ProductSales[] {
  const byProduct = new Map<string, ProductSales>();
  for (const line of orders.filter(isSale).flatMap((order) => order.lines)) {
    const entry = byProduct.get(line.productSlug) ?? {
      productSlug: line.productSlug,
      title: line.title,
      imageUrl: line.imageUrl,
      unitsSold: 0,
      revenue: 0,
    };
    entry.unitsSold += line.quantity;
    entry.revenue += line.price * line.quantity;
    byProduct.set(line.productSlug, entry);
  }
  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}
