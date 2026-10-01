import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InventoryList } from "@/components/admin/inventory/InventoryList";
import { getAdminProducts } from "@/lib/admin/queries";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const products = await getAdminProducts();
  const sorted = [...products].sort((a, b) => a.inventory.stock - b.inventory.stock);

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        description="Keep stock up to date. Products reaching their alert level show as low stock."
      />
      <InventoryList products={sorted} />
    </>
  );
}
