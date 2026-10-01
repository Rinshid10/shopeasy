import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type CheckoutStep = "cart" | "address" | "payment" | "summary";

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "cart", label: "Cart" },
  { id: "address", label: "Address" },
  { id: "payment", label: "Payment" },
  { id: "summary", label: "Summary" },
];

interface CheckoutStepsProps {
  current: CheckoutStep;
}

/** The progress line across the top of checkout: done steps are ticked, the current one is filled. */
export function CheckoutSteps({ current }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-start">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.id} className="flex flex-1 flex-col items-center gap-1.5 last:flex-none">
              <div className="flex w-full items-center">
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                    isDone && "bg-brand text-surface",
                    isCurrent && "bg-brand text-surface ring-4 ring-brand-soft",
                    !isDone && !isCurrent && "border-2 border-line bg-surface text-ink-muted",
                  )}
                >
                  {isDone ? <CheckIcon className="size-4" /> : index + 1}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mx-1 h-0.5 flex-1 rounded-full transition-colors duration-300",
                      isDone ? "bg-brand" : "bg-line",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "-ml-1 text-xs font-medium",
                  isCurrent || isDone ? "text-ink" : "text-ink-muted",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
