"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs, type FilterTab } from "@/components/admin/FilterTabs";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card } from "@/components/ui/Card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/checkout/order-dates";
import { ORDER_STATUSES, orderStatusDisplay, paymentStatusDisplay } from "@/lib/admin/labels";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { AdminOrder, AdminOrderStatus } from "@/types";

type StatusFilter = AdminOrderStatus | "all";

function matchesSearch(order: AdminOrder, query: string): boolean {
  const text = `${order.id} ${order.address.fullName} ${order.address.phone} ${order.address.city}`;
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

interface OrdersTableProps {
  orders: AdminOrder[];
}

/** Every order, filterable by status and searchable by order ID, name, phone or city. */
export function OrdersTable({ orders }: OrdersTableProps) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const tabs: FilterTab<StatusFilter>[] = [
    { value: "all", label: "All", count: orders.length },
    ...ORDER_STATUSES.map((value) => ({
      value,
      label: orderStatusDisplay[value].label,
      count: orders.filter((order) => order.status === value).length,
    })),
  ];

  const visible = useMemo(
    () =>
      orders.filter(
        (order) => (status === "all" || order.status === status) && matchesSearch(order, query),
      ),
    [orders, status, query],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          tabs={tabs}
          value={status}
          onChange={setStatus}
          label="Filter orders by status"
        />
        <SearchInput value={query} onChange={setQuery} label="Search ID, name, phone, city" />
      </div>
      <p aria-live="polite" className="text-sm text-ink-muted">
        {visible.length} {visible.length === 1 ? "order" : "orders"}
      </p>
      {visible.length === 0 ? (
        <EmptyState title="No orders found" text="Try another status or search term." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs text-ink-muted max-md:sr-only">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((order) => (
                <tr
                  key={order.id}
                  className="relative grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3 hover:bg-surface-muted md:table-row md:p-0"
                >
                  <td className="md:px-4 md:py-3">
                    <Link
                      href={routes.admin.order(order.id)}
                      className="font-semibold text-ink after:absolute after:inset-0 hover:text-brand md:after:hidden"
                    >
                      {order.id}
                    </Link>
                    <p className="text-xs text-ink-muted">{formatDateTime(order.placedAt)}</p>
                  </td>
                  <td className="row-start-2 md:px-4 md:py-3">
                    <p className="text-ink">{order.address.fullName}</p>
                    <p className="text-xs text-ink-muted">{order.address.city}</p>
                  </td>
                  <td className="text-ink-muted max-md:hidden md:px-4 md:py-3">
                    {order.lines.reduce((sum, line) => sum + line.quantity, 0)}
                  </td>
                  <td className="text-right font-bold text-ink tabular-nums md:px-4 md:py-3">
                    {formatPrice(order.total)}
                  </td>
                  <td className="max-md:hidden md:px-4 md:py-3">
                    <StatusBadge status={paymentStatusDisplay[order.paymentStatus]} />
                  </td>
                  <td className="justify-self-end md:px-4 md:py-3">
                    <StatusBadge status={orderStatusDisplay[order.status]} />
                  </td>
                  <td className="max-md:hidden md:px-4 md:py-3">
                    <Link
                      href={routes.admin.order(order.id)}
                      aria-label={`Open order ${order.id}`}
                      className="flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface hover:text-brand"
                    >
                      <ChevronRightIcon className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
