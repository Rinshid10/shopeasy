import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlusIcon } from "@/components/ui/icons";
import { getAdminProducts } from "@/lib/admin/queries";
import { getCategories } from "@/lib/categories";
import { routes } from "@/lib/routes";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getCategories()]);

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Everything in your catalogue, with price, stock and whether it's live."
        actions={
          <ButtonLink href={routes.admin.newProduct} variant="buy">
            <PlusIcon className="size-5" />
            Add product
          </ButtonLink>
        }
      />
      <ProductsTable products={products} categories={categories} />
    </>
  );
}
