import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { getAdminOrders } from "@/lib/admin/queries";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Confirm new orders, ship them and follow each one through to delivery."
      />
      <OrdersTable orders={orders} />
    </>
  );
}
