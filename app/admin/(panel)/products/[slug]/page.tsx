import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getAdminProduct } from "@/lib/admin/queries";
import { getCategories } from "@/lib/categories";
import { routes } from "@/lib/routes";

type EditProductPageProps = PageProps<"/admin/products/[slug]">;

export async function generateMetadata({ params }: EditProductPageProps) {
  const product = await getAdminProduct((await params).slug);
  return { title: product ? `Edit ${product.title}` : "Product" };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(slug), getCategories()]);
  if (!product) {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        title={product.title}
        description={`SKU ${product.inventory.sku}`}
        back={{ label: "Products", href: routes.admin.products }}
        actions={
          <ButtonLink href={routes.product(product.slug)} variant="outline">
            View in store
          </ButtonLink>
        }
      />
      <ProductForm product={product} categories={categories} />
    </>
  );
}
