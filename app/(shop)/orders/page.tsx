import { OrdersList } from "@/components/orders/OrdersList";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "My Orders",
  description: "See the orders you have placed and track their delivery.",
  path: routes.orders,
  noIndex: true,
});

export default function OrdersPage() {
  return <OrdersList />;
}
