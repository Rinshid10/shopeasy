import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductProsCons } from "@/components/product/ProductProsCons";
import { ProductSummary } from "@/components/product/ProductSummary";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategoryBySlug } from "@/lib/categories";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import type { BreadcrumbItem } from "@/types";

const MAIN_IMAGE_SIZES = "(min-width: 768px) 40vw, 100vw";

type ProductPageProps = PageProps<"/product/[slug]">;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {};
  }

  return buildPageMetadata({
    title: product.title,
    description: `${product.shortDescription} See the pros and cons, and check the latest price on Flipkart.`,
    path: routes.product(product.slug),
    image: product.imageUrl ? { url: product.imageUrl, alt: product.title } : undefined,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
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
    <Container width="narrow" className="flex flex-col gap-6 py-5 sm:gap-8 sm:py-8">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs, routes.product(product.slug))} />
      <Breadcrumbs items={breadcrumbs} />
      <Card className="grid gap-6 p-4 sm:p-6 md:grid-cols-5 md:gap-10">
        <div className="md:col-span-2">
          <ProductImage product={product} sizes={MAIN_IMAGE_SIZES} preload />
        </div>
        <div className="md:col-span-3 md:self-center">
          <ProductSummary product={product} />
        </div>
      </Card>
      <Card as="section" className="p-4 sm:p-6">
        <SectionHeading title="About this product" />
        <p className="max-w-3xl text-ink">{product.description}</p>
      </Card>
      <Card as="section" className="p-4 sm:p-6">
        <SectionHeading title="Pros and cons" />
        <ProductProsCons pros={product.pros} cons={product.cons} />
      </Card>
      {category && relatedProducts.length > 0 && (
        <section aria-labelledby="related-heading">
          <SectionHeading
            id="related-heading"
            title={`More in ${category.name}`}
            action={{ label: "View all", href: routes.category(category.slug) }}
          />
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </Container>
  );
}
