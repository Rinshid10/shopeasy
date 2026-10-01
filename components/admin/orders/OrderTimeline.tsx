import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/checkout/order-dates";
import { orderStatusDisplay } from "@/lib/admin/labels";
import type { AdminOrderEvent, AdminOrderStatus } from "@/types";

const DELIVERY_PATH: AdminOrderStatus[] = ["new", "confirmed", "shipped", "delivered"];

interface OrderTimelineProps {
  timeline: AdminOrderEvent[];
}

/**
 * The order's progress: every step reached so far with its time, then the steps still ahead
 * (greyed out) when the order is still on its way.
 */
export function OrderTimeline({ timeline }: OrderTimelineProps) {
  const reached = new Set(timeline.map((event) => event.status));
  const last = timeline[timeline.length - 1]?.status;
  const isClosed = last === "cancelled" || last === "returned";
  const upcoming = isClosed ? [] : DELIVERY_PATH.filter((status) => !reached.has(status));
  const steps = [
    ...timeline.map((event) => ({ status: event.status, at: event.at as string | undefined })),
    ...upcoming.map((status) => ({ status, at: undefined })),
  ];

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isDone = step.at !== undefined;
        const isBad = step.status === "cancelled" || step.status === "returned";
        const isLast = index === steps.length - 1;
        return (
          <li key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  isDone && !isBad && "bg-positive text-surface",
                  isDone && isBad && "bg-negative text-surface",
                  !isDone && "border-2 border-line bg-surface",
                )}
              >
                {isDone && <CheckIcon className="size-3.5" />}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "my-1 w-0.5 flex-1 rounded-full",
                    isDone ? "bg-positive" : "bg-line",
                  )}
                />
              )}
            </div>
            <div className={cn("flex flex-col pb-4", isLast && "pb-0")}>
              <span className={cn("text-sm font-semibold", isDone ? "text-ink" : "text-ink-muted")}>
                {orderStatusDisplay[step.status].label}
              </span>
              <span className="text-xs text-ink-muted">
                {step.at ? formatDateTime(step.at) : "Pending"}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
