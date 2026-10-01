import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { getExpectedDeliveryDate } from "@/lib/checkout/pricing";
import { formatShortDate } from "@/lib/checkout/order-dates";
import type { Order } from "@/types";

interface TrackerStep {
  label: string;
  detail?: string;
  state: "done" | "pending" | "cancelled";
}

function getSteps(order: Order): TrackerStep[] {
  const ordered: TrackerStep = {
    label: "Ordered",
    detail: formatShortDate(order.placedAt),
    state: "done",
  };

  if (order.status === "cancelled") {
    return [
      ordered,
      {
        label: "Cancelled",
        detail: order.cancelledAt ? formatShortDate(order.cancelledAt) : undefined,
        state: "cancelled",
      },
    ];
  }

  return [
    ordered,
    { label: "Shipped", state: "pending" },
    { label: "Out for delivery", state: "pending" },
    {
      label: "Delivered",
      detail: `Expected by ${formatShortDate(getExpectedDeliveryDate(order.placedAt))}`,
      state: "pending",
    },
  ];
}

interface OrderTrackerProps {
  order: Order;
}

/** The order's journey as a vertical timeline: Ordered, Shipped, Out for delivery, Delivered. */
export function OrderTracker({ order }: OrderTrackerProps) {
  const steps = getSteps(order);

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  step.state === "done" && "bg-positive text-surface",
                  step.state === "cancelled" && "bg-negative text-surface",
                  step.state === "pending" && "border-2 border-line bg-surface",
                )}
              >
                {step.state === "done" && <CheckIcon className="size-3.5" />}
                {step.state === "cancelled" && <CloseIcon className="size-3.5" />}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "my-1 w-0.5 flex-1 rounded-full",
                    steps[index + 1].state === "pending" ? "bg-line" : "bg-positive",
                  )}
                />
              )}
            </div>
            <div className={cn("flex flex-col pb-5", isLast && "pb-0")}>
              <span
                className={cn(
                  "text-sm font-semibold",
                  step.state === "pending" ? "text-ink-muted" : "text-ink",
                  step.state === "cancelled" && "text-negative",
                )}
              >
                {step.label}
              </span>
              {step.detail && <span className="text-xs text-ink-muted">{step.detail}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
