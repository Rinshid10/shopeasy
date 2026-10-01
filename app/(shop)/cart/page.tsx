import { CartView } from "@/components/checkout/CartView";
import { getProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Cart",
  description: "Review the products in your cart.",
  path: routes.cart,
  noIndex: true,
});

export default async function CartPage() {
  const products = await getProducts();
  return <CartView products={products} />;
}
