import { AddressStep } from "@/components/checkout/AddressStep";
import { getProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Delivery Address",
  description: "Add or choose the address for your delivery.",
  path: routes.checkoutAddress,
  noIndex: true,
});

export default async function CheckoutAddressPage() {
  const products = await getProducts();
  return <AddressStep products={products} />;
}
