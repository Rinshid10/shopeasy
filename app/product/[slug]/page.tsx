import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductProsCons } from "@/components/product/ProductProsCons";
import { ProductSummary } from "@/components/product/ProductSummary";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategoryBySlug } from "@/lib/categories";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import type { BreadcrumbItem } from "@/types";

const MAIN_IMAGE_SIZES = "(min-width: 768px) 40vw, 100vw";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const [category, relatedProducts] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getRelatedProducts(product),
  ]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: routes.home },
    ...(category ? [{ label: category.name, href: routes.category(category.slug) }] : []),
    { label: product.title },
  ];

  return (
    <Container className="flex flex-col gap-8 py-6 sm:py-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="grid gap-6 md:grid-cols-5 md:gap-10">
        <div className="md:col-span-2">
          <ProductImage product={product} sizes={MAIN_IMAGE_SIZES} preload />
        </div>
        <div className="md:col-span-3">
          <ProductSummary product={product} />
        </div>
      </div>
      <section aria-labelledby="about-heading">
        <SectionHeading id="about-heading" title="About this product" />
        <p className="max-w-3xl text-ink">{product.description}</p>
      </section>
      <section aria-labelledby="pros-cons-heading">
        <SectionHeading id="pros-cons-heading" title="Pros and cons" />
        <ProductProsCons pros={product.pros} cons={product.cons} />
      </section>
      {category && relatedProducts.length > 0 && (
        <section aria-labelledby="related-heading">
          <SectionHeading id="related-heading" title={`More in ${category.name}`} />
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </Container>
  );
}
