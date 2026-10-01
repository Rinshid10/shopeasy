import { SummaryStep } from "@/components/checkout/SummaryStep";
import { getProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Order Summary",
  description: "Review your order and place it.",
  path: routes.checkoutSummary,
  noIndex: true,
});

export default async function CheckoutSummaryPage() {
  const products = await getProducts();
  return <SummaryStep products={products} />;
}
