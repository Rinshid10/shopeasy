import { OrderSuccess } from "@/components/checkout/OrderSuccess";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Order Placed",
  description: "Your order has been placed.",
  path: routes.orderSuccess,
  noIndex: true,
});

export default function OrderSuccessPage() {
  return <OrderSuccess />;
}
