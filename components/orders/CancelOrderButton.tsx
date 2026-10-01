"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cancelOrder } from "@/lib/checkout/store";

interface CancelOrderButtonProps {
  orderId: string;
}

/** Cancels an order after the shopper confirms, right in place (no pop-up dialog). */
export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <Button variant="outline" fullWidth onClick={() => setIsConfirming(true)}>
        Cancel Order
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-labelledby="cancel-order-question"
      className="flex enter-up flex-col gap-3 rounded-2xl border border-negative/30 bg-surface p-4"
    >
      <p id="cancel-order-question" className="text-sm font-semibold text-ink">
        Cancel this order? This can&apos;t be undone.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => setIsConfirming(false)}>
          Keep Order
        </Button>
        <Button
          className="bg-negative text-surface hover:bg-negative/90"
          onClick={() => cancelOrder(orderId)}
        >
          Yes, Cancel
        </Button>
      </div>
    </div>
  );
}
