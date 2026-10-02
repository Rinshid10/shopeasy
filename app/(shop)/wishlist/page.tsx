import { WishlistProducts } from "@/components/product/WishlistProducts";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Wishlist",
  description: "The products you hearted.",
  path: routes.wishlist,
  noIndex: true,
});

/** The products the shopper hearted. Which ones is known only in the browser. */
export default async function WishlistPage() {
  const products = await getProducts();
  return (
    <Container className="flex flex-col gap-4 py-4 sm:py-6">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">Wishlist</h1>
      <WishlistProducts products={products} />
    </Container>
  );
}
