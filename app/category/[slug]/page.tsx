import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SortableProductGrid } from "@/components/product/SortableProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageTransition } from "@/components/ui/PageTransition";
import { getCategories, getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import type { BreadcrumbItem } from "@/types";

type CategoryPageProps = PageProps<"/category/[slug]">;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return {};
  }

  return buildPageMetadata({
    title: `${category.name}: Shop Online at Low Prices`,
    description: `${category.description} Free delivery and cash on delivery on ${siteConfig.name}.`,
    path: routes.category(category.slug),
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.slug);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: routes.home },
    { label: category.name },
  ];

  return (
    <PageTransition>
      <Container className="flex flex-col gap-5 py-6 sm:gap-6 sm:py-8">
        <JsonLd data={breadcrumbJsonLd(breadcrumbs, routes.category(category.slug))} />
        <Breadcrumbs items={breadcrumbs} />
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {category.name}
          </h1>
          <p className="mt-1.5 max-w-2xl text-ink-muted">{category.description}</p>
        </header>
        {products.length > 0 ? (
          <SortableProductGrid products={products} />
        ) : (
          <p className="text-ink-muted">
            No products in this category yet. Please check back soon.
          </p>
        )}
      </Container>
    </PageTransition>
  );
}
