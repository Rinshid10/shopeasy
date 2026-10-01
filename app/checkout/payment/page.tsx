import { PaymentStep } from "@/components/checkout/PaymentStep";
import { getProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Payment",
  description: "Choose how to pay for your order.",
  path: routes.checkoutPayment,
  noIndex: true,
});

export default async function CheckoutPaymentPage() {
  const products = await getProducts();
  return <PaymentStep products={products} />;
}
