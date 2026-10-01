"use client";

import { useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { SearchInput } from "@/components/admin/SearchInput";
import { Card } from "@/components/ui/Card";
import { ChatIcon } from "@/components/ui/icons";
import { formatShortDate } from "@/lib/checkout/order-dates";
import type { CustomerSummary } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";

interface CustomersTableProps {
  customers: CustomerSummary[];
}

/** Customers ranked by spend, searchable by name, phone or city. */
export function CustomersTable({ customers }: CustomersTableProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.city}`.toLowerCase().includes(needle),
  );

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={query} onChange={setQuery} label="Search name, phone, city" />
      <p aria-live="polite" className="text-sm text-ink-muted">
        {visible.length} {visible.length === 1 ? "customer" : "customers"}
      </p>
      {visible.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface-muted text-xs text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 text-right font-semibold">Orders</th>
                <th className="px-4 py-3 text-right font-semibold">Total spent</th>
                <th className="px-4 py-3 font-semibold">Last order</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Contact</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((customer) => (
                <tr key={customer.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{customer.name}</p>
                    <p className="text-xs text-ink-muted">+91 {customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{customer.city}</td>
                  <td className="px-4 py-3 text-right text-ink tabular-nums">
                    {customer.orderCount}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-ink tabular-nums">
                    {formatPrice(customer.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {customer.lastOrderAt ? formatShortDate(customer.lastOrderAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://wa.me/91${customer.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${customer.name}`}
                      className="flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-positive-soft hover:text-positive"
                    >
                      <ChatIcon className="size-5" />
                    </a>
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
