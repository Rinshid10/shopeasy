import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { getCategories } from "@/lib/categories";
import { routes } from "@/lib/routes";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <>
      <AdminPageHeader
        title="Add product"
        back={{ label: "Products", href: routes.admin.products }}
      />
      <ProductForm categories={categories} />
    </>
  );
}
