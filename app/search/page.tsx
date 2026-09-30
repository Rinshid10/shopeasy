import { ProductSearch } from "@/components/product/ProductSearch";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/products";

export default async function SearchPage() {
  const products = await getProducts();

  return (
    <Container className="flex flex-col gap-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Search products</h1>
      <ProductSearch products={products} />
    </Container>
  );
}
