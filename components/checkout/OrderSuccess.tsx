"use client";

import { AddressCard } from "@/components/checkout/AddressCard";
import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { OrderLines } from "@/components/checkout/OrderLines";
import { WhatsAppOrderButton } from "@/components/orders/WhatsAppOrderButton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CheckIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { formatShortDate } from "@/lib/checkout/order-dates";
import { getExpectedDeliveryDate } from "@/lib/checkout/pricing";
import { useCheckout } from "@/lib/checkout/use-checkout";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

/** The confirmation screen shown after an order is placed. */
export function OrderSuccess() {
  const checkout = useCheckout();

  if (!checkout) {
    return <CheckoutLoading />;
  }

  const order = checkout.orders[0];
  if (!order) {
    return (
      <Container width="narrow" className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-xl font-extrabold text-ink">No recent order</h1>
        <p className="text-ink-muted">Orders you place will be confirmed here.</p>
        <ButtonLink href={routes.home} variant="brand" size="lg">
          Start Shopping
        </ButtonLink>
      </Container>
    );
  }

  const deliveryDate = formatShortDate(getExpectedDeliveryDate(order.placedAt));

  return (
    <Container width="narrow" className="flex flex-col gap-5 py-8 sm:py-12">
      <section className="flex flex-col items-center gap-3 text-center">
        <span className="relative flex size-20 items-center justify-center">
          <span className="relative flex size-20 items-center justify-center rounded-full bg-positive text-surface shadow-lg shadow-positive/30">
            <CheckIcon className="size-10" />
          </span>
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Order placed!</h1>
        <p className="text-ink-muted">
          Order ID <span className="font-semibold text-ink">{order.id}</span>
        </p>
        <p className="rounded-full bg-positive-soft px-4 py-1.5 text-sm font-semibold text-positive">
          Expected delivery by {deliveryDate}
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-3 p-4 sm:p-5">
          <h2 className="font-bold text-ink">Delivering to</h2>
          <AddressCard address={order.address} />
        </Card>
        <Card className="flex flex-col gap-3 p-4 sm:p-5">
          <h2 className="font-bold text-ink">Your order</h2>
          <OrderLines lines={order.lines} />
          <p className="flex justify-between border-t border-dashed border-line pt-3 font-bold text-ink">
            <span>Pay on delivery</span>
            <span>{formatPrice(order.total)}</span>
          </p>
        </Card>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col gap-2 text-center">
        <WhatsAppOrderButton order={order} />
        <p className="text-xs text-ink-muted">
          WhatsApp opens with your order details. Tap send to keep them in your chat.
        </p>
      </div>
      {siteConfig.demoStore.isEnabled && (
        <p className="text-center text-sm text-ink-muted">{siteConfig.demoStore.orderNote}</p>
      )}
      <div className="mx-auto grid w-full max-w-md gap-3 sm:grid-cols-2">
        <ButtonLink
          href={routes.orderDetails(order.id)}
          variant="outline-brand"
          size="lg"
          fullWidth
        >
          View Order
        </ButtonLink>
        <ButtonLink href={routes.home} variant="buy" size="lg" fullWidth>
          Continue Shopping
        </ButtonLink>
      </div>
    </Container>
  );
}
