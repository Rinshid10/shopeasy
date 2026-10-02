import { notFound } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderManager } from "@/components/admin/orders/OrderManager";
import { AddressCard } from "@/components/checkout/AddressCard";
import { OrderLines } from "@/components/checkout/OrderLines";
import { formatDateTime } from "@/lib/checkout/order-dates";
import { paymentStatusDisplay } from "@/lib/admin/labels";
import { getAdminOrder, getCustomer } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";

type AdminOrderPageProps = PageProps<"/admin/orders/[id]">;

export async function generateMetadata({ params }: AdminOrderPageProps) {
  const { id } = await params;
  return { title: `Order ${id}` };
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) {
    notFound();
  }
  const customer = await getCustomer(order.customerId);
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <>
      <AdminPageHeader
        title={`Order ${order.id}`}
        description={`Placed ${formatDateTime(order.placedAt)} · ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        back={{ label: "Orders", href: routes.admin.orders }}
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-5">
          <AdminCard title="Items">
            <OrderLines lines={order.lines} />
            <dl className="flex flex-col gap-2 border-t border-dashed border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Delivery</dt>
                {order.deliveryCharge === 0 ? (
                  <dd className="font-medium text-positive">FREE</dd>
                ) : (
                  <dd className="tabular-nums">{formatPrice(order.deliveryCharge)}</dd>
                )}
              </div>
              <div className="flex justify-between text-base font-bold text-ink">
                <dt>Total (Cash on Delivery)</dt>
                <dd className="tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              Payment:
              <StatusBadge status={paymentStatusDisplay[order.paymentStatus]} />
            </div>
          </AdminCard>
          <AdminCard title="Customer">
            {(order.customerName || order.customerEmail) && (
              <p className="text-sm text-ink">
                <span className="font-semibold">{order.customerName}</span>
                {order.customerEmail && (
                  <>
                    {" · "}
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-brand hover:underline"
                    >
                      {order.customerEmail}
                    </a>
                  </>
                )}
              </p>
            )}
            <AddressCard address={order.address} />
            {customer && (
              <p className="text-sm text-ink-muted">
                {customer.kind === "account" ? "Logged-in customer" : "Guest"} · joined{" "}
                {formatDateTime(customer.joinedAt)} · {customer.orderCount}{" "}
                {customer.orderCount === 1 ? "order" : "orders"}
              </p>
            )}
          </AdminCard>
        </div>
        <OrderManager order={order} />
      </div>
    </>
  );
}
