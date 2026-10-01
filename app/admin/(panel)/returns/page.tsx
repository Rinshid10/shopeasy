import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReturnsList } from "@/components/admin/returns/ReturnsList";
import { getCustomers, getReturns, getStoreSettings } from "@/lib/admin/queries";

export const metadata = { title: "Returns" };

export default async function ReturnsPage() {
  const [returns, customers, settings] = await Promise.all([
    getReturns(),
    getCustomers(),
    getStoreSettings(),
  ]);
  const withNames = returns.map((item) => ({
    ...item,
    customerName: customers.find((customer) => customer.id === item.customerId)?.name ?? "Customer",
  }));

  return (
    <>
      <AdminPageHeader
        title="Returns"
        description={`Customers can ask for a return within ${settings.returnWindowDays} days of delivery. Approve to arrange pickup.`}
      />
      <ReturnsList returns={withNames} />
    </>
  );
}
