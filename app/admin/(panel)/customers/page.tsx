import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";
import { getCustomers } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await getCustomers();
  const buyers = customers.filter((customer) => customer.orderCount > 0);
  const loggedIn = customers.filter((customer) => customer.kind === "account").length;
  const totalSpent = buyers.reduce((sum, customer) => sum + customer.totalSpent, 0);

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Everyone who has logged in or given their name and email to buy."
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Customers" value={String(customers.length)} />
        <StatTile label="Logged in" value={String(loggedIn)} />
        <StatTile label="Have ordered" value={String(buyers.length)} />
        <StatTile
          label="Average spend per customer"
          value={formatPrice(buyers.length ? Math.round(totalSpent / buyers.length) : 0)}
        />
      </div>
      <CustomersTable customers={customers} />
    </>
  );
}
