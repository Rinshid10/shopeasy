import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductSummary } from "@/components/product/ProductSummary";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCategoryBySlug } from "@/lib/categories";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/products";
import { getProductOptions } from "@/lib/product-options";
import { getReviewSummary } from "@/lib/reviews";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import type { BreadcrumbItem } from "@/types";

const MAIN_IMAGE_SIZES = "(min-width: 768px) 40vw, 100vw";
/** How many products "People also viewed" shows. */
const RELATED_COUNT = 10;

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
    description: `${product.shortDescription} Free delivery and cash on delivery on ${siteConfig.name}.`,
    path: routes.product(product.slug),
    image: product.imageUrl ? { url: product.imageUrl, alt: product.title } : undefined,
  });
}

/**
 * A product page: pictures beside the main box (price, options, quantity, Buy Now), then the
 * description and specifications, reviews, and products people also viewed.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const [category, relatedProducts, reviews] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getRelatedProducts(product, RELATED_COUNT),
    getReviewSummary(product.slug),
  ]);
  const options = getProductOptions(product);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: routes.home },
    ...(category ? [{ label: category.name, href: routes.category(category.slug) }] : []),
    { label: product.title },
  ];

  return (
    <>
      <Container width="narrow" className="flex flex-col gap-5 py-4 sm:gap-8 sm:py-6">
        <JsonLd data={breadcrumbJsonLd(breadcrumbs, routes.product(product.slug))} />
        <Breadcrumbs items={breadcrumbs} />
        <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-6">
          <div className="md:sticky md:top-32">
            <ProductGallery product={product} sizes={MAIN_IMAGE_SIZES} />
          </div>
          <ProductSummary product={product} options={options} />
        </div>
        <ProductInfo product={product} />
        <ProductReviews summary={reviews} meesho={product.meesho} />
        {relatedProducts.length > 0 && (
          <section aria-labelledby="related-heading" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 id="related-heading" className="text-xl font-bold text-ink">
                People also viewed
              </h2>
              {category && (
                <Link
                  href={routes.category(category.slug)}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
            <ProductCarousel products={relatedProducts} label="People also viewed" />
          </section>
        )}
      </Container>
      <StickyBuyBar product={product} options={options} />
    </>
  );
}
