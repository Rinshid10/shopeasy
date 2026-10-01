"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckoutLoading, EmptyCart } from "@/components/checkout/CheckoutStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CashIcon, CheckIcon, LockIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { useCartView } from "@/lib/checkout/use-cart-view";
import { routes } from "@/lib/routes";
import type { Product } from "@/types";

interface PaymentStepProps {
  products: Product[];
}

/** Step 3: choose how to pay. Cash on Delivery is the only option for now. */
export function PaymentStep({ products }: PaymentStepProps) {
  const router = useRouter();
  const view = useCartView(products);
  const hasNoAddress = view !== null && view.lines.length > 0 && !view.checkout.address;

  // Payment needs a delivery address, so send visitors who skipped that step back to it.
  useEffect(() => {
    if (hasNoAddress) {
      router.replace(routes.checkoutAddress);
    }
  }, [hasNoAddress, router]);

  if (!view || hasNoAddress) {
    return <CheckoutLoading />;
  }
  if (view.lines.length === 0) {
    return <EmptyCart />;
  }

  return (
    <CheckoutLayout
      step="payment"
      title="Select Payment Method"
      summary={view.summary}
      action={
        <Button
          variant="buy"
          size="lg"
          fullWidth
          onClick={() => router.push(routes.checkoutSummary)}
        >
          Continue
        </Button>
      }
    >
      <Card className="p-4 sm:p-5">
        <div role="radiogroup" aria-label="Payment method" className="flex flex-col gap-3">
          <div
            role="radio"
            aria-checked="true"
            className="flex items-center gap-3 rounded-2xl border-2 border-brand bg-brand-soft p-4"
          >
            <CashIcon className="size-7 shrink-0 text-brand" />
            <div className="flex-1">
              <p className="font-semibold text-ink">Cash on Delivery</p>
              <p className="text-sm text-ink-muted">
                Pay {formatPrice(view.summary.total)} in cash or UPI when your order arrives.
              </p>
            </div>
            <span className="flex size-6 items-center justify-center rounded-full bg-brand text-surface">
              <CheckIcon className="size-4" />
            </span>
          </div>
          <div
            role="radio"
            aria-checked="false"
            aria-disabled="true"
            className="flex items-center gap-3 rounded-2xl border border-line p-4 opacity-60"
          >
            <LockIcon className="size-7 shrink-0 text-ink-muted" />
            <div className="flex-1">
              <p className="font-semibold text-ink">Pay Online</p>
              <p className="text-sm text-ink-muted">UPI, cards and net banking. Coming soon.</p>
            </div>
          </div>
        </div>
      </Card>
    </CheckoutLayout>
  );
}
