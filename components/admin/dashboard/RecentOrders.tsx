import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDateTime } from "@/lib/checkout/order-dates";
import { orderStatusDisplay } from "@/lib/admin/labels";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { AdminOrder } from "@/types";

interface RecentOrdersProps {
  orders: AdminOrder[];
}

/** The latest orders, each opening its details. */
export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <ul className="divide-y divide-line">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={routes.admin.order(order.id)}
            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-surface-muted"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-semibold text-ink">
                {order.id} · {order.address.fullName}
              </span>
              <span className="truncate text-xs text-ink-muted">
                {formatDateTime(order.placedAt)} · {order.address.city}
              </span>
            </span>
            <span className="flex flex-col items-end gap-1">
              <span className="text-sm font-bold text-ink tabular-nums">
                {formatPrice(order.total)}
              </span>
              <StatusBadge status={orderStatusDisplay[order.status]} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
