"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddressCard } from "@/components/checkout/AddressCard";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckoutLoading, EmptyCart } from "@/components/checkout/CheckoutStatus";
import { OrderLines } from "@/components/checkout/OrderLines";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CashIcon } from "@/components/ui/icons";
import { placeOrder } from "@/lib/checkout/store";
import { getOrderWhatsAppUrl } from "@/lib/checkout/whatsapp";
import { useCartView } from "@/lib/checkout/use-cart-view";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types";

interface SummaryStepProps {
  products: Product[];
}

const changeLinkClasses = "text-sm font-semibold text-brand hover:underline";

/** Step 4: review address, products and payment, then place the order. */
export function SummaryStep({ products }: SummaryStepProps) {
  const router = useRouter();
  const view = useCartView(products);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const address = view?.checkout.address ?? null;
  const hasNoAddress = view !== null && view.lines.length > 0 && !address;

  useEffect(() => {
    if (hasNoAddress) {
      router.replace(routes.checkoutAddress);
    }
  }, [hasNoAddress, router]);

  // While placing, the cart empties before the confirmation screen opens: keep the
  // placeholder up so the visitor never sees an empty cart flash past.
  if (!view || isPlacing) {
    return <CheckoutLoading />;
  }
  if (view.lines.length === 0) {
    return <EmptyCart />;
  }
  if (!address) {
    return <CheckoutLoading />;
  }

  async function placeTheOrder() {
    setIsPlacing(true);
    setPlaceError(null);
    // Open the WhatsApp tab inside this tap, or the browser blocks it as a pop-up, then point
    // it at the order once the database has placed it. The confirmation screen has a button
    // to try again if it was blocked anyway.
    const whatsAppTab = window.open("about:blank", "_blank");
    try {
      const order = await placeOrder();
      if (whatsAppTab) {
        whatsAppTab.opener = null;
        whatsAppTab.location.href = getOrderWhatsAppUrl(order);
      }
      router.replace(routes.orderSuccess);
    } catch (error) {
      whatsAppTab?.close();
      setPlaceError(error instanceof Error ? error.message : "Couldn't place the order.");
      setIsPlacing(false);
    }
  }

  return (
    <CheckoutLayout
      step="summary"
      title="Order Summary"
      summary={view.summary}
      action={
        <Button variant="buy" size="lg" fullWidth disabled={isPlacing} onClick={placeTheOrder}>
          {isPlacing ? "Placing order…" : "Place Order"}
        </Button>
      }
    >
      <Card className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-ink">Delivery Address</h2>
          <Link href={routes.checkoutAddress} className={changeLinkClasses}>
            Change
          </Link>
        </div>
        <AddressCard address={address} />
      </Card>
      <Card className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-ink">Products</h2>
          <Link href={routes.cart} className={changeLinkClasses}>
            Edit
          </Link>
        </div>
        <OrderLines
          lines={view.lines.map(({ product, quantity }) => ({
            productSlug: product.slug,
            title: product.title,
            imageUrl: product.imageUrl,
            price: product.price,
            quantity,
          }))}
        />
      </Card>
      <Card className="flex items-center gap-3 p-4 sm:p-5">
        <CashIcon className="size-6 shrink-0 text-brand" />
        <p className="flex-1 font-semibold text-ink">Cash on Delivery</p>
        <Link href={routes.checkoutPayment} className={changeLinkClasses}>
          Change
        </Link>
      </Card>
      {placeError && (
        <p role="alert" className="text-sm font-semibold text-negative">
          {placeError}. Please try again.
        </p>
      )}
      {siteConfig.demoStore.isEnabled && (
        <p className="text-sm text-ink-muted">{siteConfig.demoStore.orderNote}</p>
      )}
    </CheckoutLayout>
  );
}
