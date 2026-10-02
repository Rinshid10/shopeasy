"use client";

import { useState, useTransition } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { SaveStatus, type SaveState } from "@/components/admin/SaveStatus";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderTimeline } from "@/components/admin/orders/OrderTimeline";
import { Button } from "@/components/ui/Button";
import { ChatIcon, PrinterIcon } from "@/components/ui/icons";
import { setOrderStatus } from "@/lib/admin/actions";
import { nextOrderStatus, orderStatusDisplay } from "@/lib/admin/labels";
import type { AdminOrder, AdminOrderStatus } from "@/types";

interface OrderManagerProps {
  order: AdminOrder;
}

/** The order's status, its timeline, and the actions that move it along. */
export function OrderManager({ order }: OrderManagerProps) {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isSaving, startSaving] = useTransition();
  const { timeline, status } = order;
  const next = nextOrderStatus[status];
  const canCancel = status === "new" || status === "confirmed";

  function moveTo(nextStatus: AdminOrderStatus) {
    setIsConfirmingCancel(false);
    setSaveState({ status: "saving" });
    startSaving(async () => {
      // On success the page reloads the order, so the badge and timeline update.
      const result = await setOrderStatus(order.id, nextStatus);
      setSaveState(
        result.ok
          ? { status: "saved", text: `Marked as ${orderStatusDisplay[nextStatus].label}.` }
          : { status: "error", error: result.error },
      );
    });
  }

  const whatsappMessage = encodeURIComponent(
    `Hello ${order.address.fullName}, an update on your order ${order.id}: it is now ${orderStatusDisplay[status].label.toLowerCase()}.`,
  );

  return (
    <AdminCard title="Status">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={orderStatusDisplay[status]} />
      </div>
      <OrderTimeline timeline={timeline} />
      <div className="flex flex-col gap-2 border-t border-line pt-4 print:hidden">
        {next && (
          <Button variant="buy" fullWidth disabled={isSaving} onClick={() => moveTo(next)}>
            Mark as {orderStatusDisplay[next].label}
          </Button>
        )}
        {canCancel &&
          (isConfirmingCancel ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setIsConfirmingCancel(false)}>
                Keep order
              </Button>
              <Button variant="danger" disabled={isSaving} onClick={() => moveTo("cancelled")}>
                Yes, cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" fullWidth onClick={() => setIsConfirmingCancel(true)}>
              Cancel order
            </Button>
          ))}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/91${order.address.phone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-ink hover:border-positive hover:text-positive"
          >
            <ChatIcon className="size-5" />
            WhatsApp
          </a>
          <Button variant="outline" onClick={() => window.print()}>
            <PrinterIcon className="size-5" />
            Invoice
          </Button>
        </div>
        <SaveStatus state={saveState} />
      </div>
    </AdminCard>
  );
}
