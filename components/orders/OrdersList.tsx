"use client";

import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { OrderCard } from "@/components/orders/OrderCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { PackageIcon } from "@/components/ui/icons";
import { useCheckout } from "@/lib/checkout/use-checkout";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

/** The My Orders screen: every order placed from this browser, newest first. */
export function OrdersList() {
  const checkout = useCheckout();

  if (!checkout) {
    return <CheckoutLoading />;
  }

  const { orders } = checkout;

  if (orders.length === 0) {
    return (
      <Container width="narrow" className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-brand-soft text-brand">
          <PackageIcon className="size-10" />
        </span>
        <h1 className="text-xl font-extrabold text-ink">No orders yet</h1>
        <p className="max-w-xs text-ink-muted">Orders you place will show up here.</p>
        <ButtonLink href={routes.home} variant="brand" size="lg">
          Start Shopping
        </ButtonLink>
      </Container>
    );
  }

  return (
    <Container width="narrow" className="flex flex-col gap-4 py-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">My Orders</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
      {siteConfig.demoStore.isEnabled && (
        <p className="text-xs text-ink-muted">
          Demo store: these orders are saved only in this browser.
        </p>
      )}
    </Container>
  );
}
