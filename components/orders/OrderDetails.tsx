"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AddressCard } from "@/components/checkout/AddressCard";
import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { OrderLines } from "@/components/checkout/OrderLines";
import { CancelOrderButton } from "@/components/orders/CancelOrderButton";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { WhatsAppOrderButton } from "@/components/orders/WhatsAppOrderButton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CashIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { describeOrderStatus, formatDateTime } from "@/lib/checkout/order-dates";
import { useCheckout } from "@/lib/checkout/use-checkout";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

/** One order in full: progress, products, delivery address, payment and a cancel option. */
export function OrderDetails() {
  const checkout = useCheckout();
  const orderId = useSearchParams().get("id");

  if (!checkout) {
    return <CheckoutLoading />;
  }

  const order = checkout.orders.find((candidate) => candidate.id === orderId);
  if (!order) {
    return (
      <Container width="narrow" className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-xl font-extrabold text-ink">Order not found</h1>
        <p className="text-ink-muted">We couldn&apos;t find this order in this browser.</p>
        <ButtonLink href={routes.orders} variant="brand" size="lg">
          View My Orders
        </ButtonLink>
      </Container>
    );
  }

  const isCancelled = order.status === "cancelled";

  return (
    <Container width="narrow" className="flex flex-col gap-4 py-6 sm:py-8">
      <nav aria-label="Breadcrumb">
        <Link
          href={routes.orders}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          <ChevronRightIcon className="size-4 rotate-180" />
          My Orders
        </Link>
      </nav>
      <header className="">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Order {order.id}</h1>
        <p className="mt-1 text-sm text-ink-muted">Placed on {formatDateTime(order.placedAt)}</p>
      </header>
      <div className="grid items-start gap-4 md:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 p-4 sm:p-5">
            <h2 className={cn("font-bold", isCancelled ? "text-negative" : "text-positive")}>
              {describeOrderStatus(order)}
            </h2>
            <OrderTracker order={order} />
          </Card>
          <Card className="flex flex-col gap-3 p-4 sm:p-5">
            <h2 className="font-bold text-ink">Products</h2>
            <OrderLines lines={order.lines} />
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 p-4 sm:p-5">
            <h2 className="font-bold text-ink">Delivery Address</h2>
            <AddressCard address={order.address} />
          </Card>
          <Card className="flex flex-col gap-3 p-4 sm:p-5">
            <h2 className="font-bold text-ink">Payment</h2>
            <p className="flex items-center gap-2 text-sm text-ink">
              <CashIcon className="size-5 text-brand" />
              Cash on Delivery
            </p>
            <p className="flex justify-between border-t border-dashed border-line pt-3 font-bold text-ink">
              <span>{isCancelled ? "Order total" : "Pay on delivery"}</span>
              <span>{formatPrice(order.total)}</span>
            </p>
          </Card>
          {!isCancelled && <WhatsAppOrderButton order={order} />}
          {!isCancelled && <CancelOrderButton orderId={order.id} />}
          <p className="text-center text-xs text-ink-muted">
            Need help with this order? Write to{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-medium text-brand underline"
            >
              {siteConfig.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </Container>
  );
}
