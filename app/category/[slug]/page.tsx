import { notFound } from "next/navigation";
import { SortableProductGrid } from "@/components/product/SortableProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCategories, getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { routes } from "@/lib/routes";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.slug);

  return (
    <Container className="flex flex-col gap-6 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: routes.home }, { label: category.name }]} />
      <header>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{category.name}</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">{category.description}</p>
      </header>
      {products.length > 0 ? (
        <SortableProductGrid products={products} />
      ) : (
        <p className="text-ink-muted">No products in this category yet. Please check back soon.</p>
      )}
    </Container>
  );
}
