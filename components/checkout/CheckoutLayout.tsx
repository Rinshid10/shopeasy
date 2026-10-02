import type { ReactNode } from "react";
import { CheckoutSteps, type CheckoutStep } from "@/components/checkout/CheckoutSteps";
import { PriceDetails } from "@/components/checkout/PriceDetails";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { LockIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import type { PriceSummary } from "@/lib/checkout/pricing";

interface CheckoutLayoutProps {
  step: CheckoutStep;
  title: string;
  summary: PriceSummary;
  /** The step's main button, e.g. "Continue". Shown in the side panel and in the phone bottom bar. */
  action: ReactNode;
  children: ReactNode;
}

/**
 * The frame shared by every checkout step: progress at the top, the step's content on the
 * left, and price details with the main button on the right. On phones the total and the
 * button sit in a bar fixed to the bottom of the screen.
 */
export function CheckoutLayout({ step, title, summary, action, children }: CheckoutLayoutProps) {
  return (
    <Container width="narrow" className="flex flex-col gap-5 pt-5 pb-28 sm:pt-8 md:pb-10">
      <CheckoutSteps current={step} />
      <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{title}</h1>
      <div className="grid items-start gap-5 md:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-4">{children}</div>
        <aside className="flex flex-col gap-4 md:sticky md:top-40">
          <Card className="p-4 sm:p-5">
            <PriceDetails summary={summary} />
          </Card>
          <div className="hidden md:block">{action}</div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
            <LockIcon className="size-4" />
            Safe and secure checkout
          </p>
        </aside>
      </div>
      <div className="bottom-action-bar fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-line bg-surface px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_24px_-14px_rgb(15_23_42/0.3)] md:hidden">
        <p className="flex flex-col">
          <span className="text-lg leading-tight font-extrabold text-ink">
            {formatPrice(summary.total)}
          </span>
          <span className="text-xs text-ink-muted">Order total</span>
        </p>
        <div className="flex-1">{action}</div>
      </div>
    </Container>
  );
}
