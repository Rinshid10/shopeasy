import { Suspense } from "react";
import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Order Details",
  description: "Track your order and see its details.",
  path: "/orders/details",
  noIndex: true,
});

export default function OrderDetailsPage() {
  // The order id is read from the address in the browser, so the page itself stays static.
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <OrderDetails />
    </Suspense>
  );
}
