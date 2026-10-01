"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { SaveStatus, type SaveState } from "@/components/admin/SaveStatus";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { setReturnStatus } from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/checkout/order-dates";
import { returnStatusDisplay } from "@/lib/admin/labels";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { ReturnRequest, ReturnStatus } from "@/types";

type ReturnFilter = ReturnStatus | "all";

interface ReturnsListProps {
  returns: (ReturnRequest & { customerName: string })[];
}

/** Return requests with the reason, and approve / reject for those still waiting. */
export function ReturnsList({ returns: initialReturns }: ReturnsListProps) {
  const [returns, setReturns] = useState(initialReturns);
  const [filter, setFilter] = useState<ReturnFilter>("requested");
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const visible = returns.filter((item) => filter === "all" || item.status === filter);
  const count = (status: ReturnStatus) => returns.filter((item) => item.status === status).length;

  function decide(id: string, status: ReturnStatus) {
    const previous = returns.find((item) => item.id === id)?.status;
    setReturns((list) => list.map((item) => (item.id === id ? { ...item, status } : item)));
    setSaveState({ status: "saving" });
    void setReturnStatus(id, status).then((result) => {
      if (result.ok) {
        setSaveState({
          status: "saved",
          text: `Return ${returnStatusDisplay[status].label.toLowerCase()}.`,
        });
      } else {
        setReturns((list) =>
          list.map((item) => (item.id === id && previous ? { ...item, status: previous } : item)),
        );
        setSaveState({ status: "error", error: result.error });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterTabs
        label="Filter returns"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: "requested", label: "Waiting", count: count("requested") },
          { value: "approved", label: "Approved", count: count("approved") },
          { value: "refunded", label: "Refunded", count: count("refunded") },
          { value: "rejected", label: "Rejected", count: count("rejected") },
          { value: "all", label: "All", count: returns.length },
        ]}
      />
      <SaveStatus state={saveState} />
      {visible.length === 0 ? (
        <EmptyState title="No returns here" text="New requests from customers will appear here." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((item) => (
            <li key={item.id}>
              <Card className="flex h-full enter-up flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{item.productTitle}</p>
                    <p className="text-xs text-ink-muted">
                      {item.id} ·{" "}
                      <Link
                        href={routes.admin.order(item.orderId)}
                        className="text-brand hover:underline"
                      >
                        Order {item.orderId}
                      </Link>{" "}
                      · {item.customerName}
                    </p>
                  </div>
                  <StatusBadge status={returnStatusDisplay[item.status]} />
                </div>
                <p className="rounded-xl bg-surface-muted p-3 text-sm text-ink">“{item.reason}”</p>
                <p className="text-xs text-ink-muted">
                  Requested {formatDateTime(item.requestedAt)} · refund {formatPrice(item.amount)}
                </p>
                {item.status === "requested" && (
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => decide(item.id, "rejected")}>
                      Reject
                    </Button>
                    <Button variant="buy" onClick={() => decide(item.id, "approved")}>
                      Approve pickup
                    </Button>
                  </div>
                )}
                {item.status === "approved" && (
                  <Button variant="outline" onClick={() => decide(item.id, "refunded")}>
                    Mark refunded
                  </Button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
