"use client";

import { useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card } from "@/components/ui/Card";
import { ChatIcon } from "@/components/ui/icons";
import { formatShortDate } from "@/lib/checkout/order-dates";
import type { CustomerSummary } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";

type KindFilter = CustomerSummary["kind"] | "all";

interface CustomersTableProps {
  customers: CustomerSummary[];
}

/** Every signed-up customer and guest, searchable by name, email, phone or city. */
export function CustomersTable({ customers }: CustomersTableProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const needle = query.trim().toLowerCase();
  const visible = customers.filter(
    (customer) =>
      (kind === "all" || customer.kind === kind) &&
      `${customer.name} ${customer.email ?? ""} ${customer.phone} ${customer.city}`
        .toLowerCase()
        .includes(needle),
  );
  const countOf = (value: CustomerSummary["kind"]) =>
    customers.filter((customer) => customer.kind === value).length;

  return (
    <div className="flex flex-col gap-4">
      <FilterTabs
        label="Filter customers"
        value={kind}
        onChange={setKind}
        tabs={[
          { value: "all", label: "All", count: customers.length },
          { value: "account", label: "Logged in", count: countOf("account") },
          { value: "guest", label: "Guests", count: countOf("guest") },
        ]}
      />
      <SearchInput value={query} onChange={setQuery} label="Search name, email, phone, city" />
      <p aria-live="polite" className="text-sm text-ink-muted">
        {visible.length} {visible.length === 1 ? "customer" : "customers"}
      </p>
      {visible.length === 0 ? (
        <EmptyState
          title="No customers yet"
          text="People appear here when they log in or give their name and email to buy."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-surface-muted text-xs text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
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
                    {customer.email && (
                      <a
                        href={`mailto:${customer.email}`}
                        className="block text-xs text-brand hover:underline"
                      >
                        {customer.email}
                      </a>
                    )}
                    {(customer.phone || customer.city) && (
                      <p className="text-xs text-ink-muted">
                        {[customer.phone && `+91 ${customer.phone}`, customer.city]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={
                        customer.kind === "account"
                          ? { label: "Logged in", tone: "good" }
                          : { label: "Guest", tone: "neutral" }
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatShortDate(customer.joinedAt)}</td>
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
                    {customer.phone && (
                      <a
                        href={`https://wa.me/91${customer.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${customer.name}`}
                        className="flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-positive-soft hover:text-positive"
                      >
                        <ChatIcon className="size-5" />
                      </a>
                    )}
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
