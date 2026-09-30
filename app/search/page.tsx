import { ProductSearchResults } from "@/components/product/ProductSearchResults";
import { SearchForm } from "@/components/product/SearchForm";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

// Search results are filtered in the browser, so every query shares this one page.
// It is kept out of search engines to avoid thin, duplicate result pages.
export const metadata = buildPageMetadata({
  title: "Search products",
  description: `Search ${siteConfig.name}'s handpicked mobile accessories by product or brand.`,
  path: routes.search,
  noIndex: true,
});

export default async function SearchPage() {
  const products = await getProducts();

  return (
    <Container className="flex flex-col gap-4 py-6 sm:py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Search products
      </h1>
      {/* Larger screens already have the search bar in the header. */}
      <div className="md:hidden">
        <SearchForm />
      </div>
      <ProductSearchResults products={products} />
    </Container>
  );
}
