import { AdminCard } from "@/components/admin/AdminCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SalesChart } from "@/components/admin/SalesChart";
import { StatTile } from "@/components/admin/StatTile";
import { ActionItems } from "@/components/admin/dashboard/ActionItems";
import { LowStock } from "@/components/admin/dashboard/LowStock";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { TopProducts } from "@/components/admin/dashboard/TopProducts";
import { getAdminOrders, getAdminProducts, getReportingNow, getReturns } from "@/lib/admin/queries";
import { getStockLevel } from "@/lib/admin/labels";
import {
  comparePeriods,
  countByStatus,
  dailySales,
  percentChange,
  topProducts,
} from "@/lib/admin/stats";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";

export const metadata = { title: "Dashboard" };

const KPI_DAYS = 7;
const CHART_DAYS = 14;

export default async function AdminDashboardPage() {
  const [orders, products, returns, now] = await Promise.all([
    getAdminOrders(),
    getAdminProducts(),
    getReturns(),
    getReportingNow(),
  ]);

  const { current, previous } = comparePeriods(orders, now, KPI_DAYS);
  const statusCounts = countByStatus(orders);
  const lowStock = products
    .filter(
      (product) =>
        getStockLevel(product.inventory.stock, product.inventory.lowStockThreshold) !== "in-stock",
    )
    .sort((a, b) => a.inventory.stock - b.inventory.stock);
  const changeLabel = `vs previous ${KPI_DAYS} days`;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`Your store at a glance. Figures cover the last ${KPI_DAYS} days unless noted.`}
      />
      <div className="flex flex-col gap-5">
        <section aria-labelledby="needs-attention-heading" className="enter-up">
          <h2 id="needs-attention-heading" className="mb-3 text-sm font-bold text-ink">
            Needs your attention
          </h2>
          <ActionItems
            items={[
              {
                label: "New orders to confirm",
                count: statusCounts.new,
                href: routes.admin.orders,
                icon: "orders",
              },
              {
                label: "Confirmed, ready to ship",
                count: statusCounts.confirmed,
                href: routes.admin.orders,
                icon: "ship",
              },
              {
                label: "Return requests",
                count: returns.filter((item) => item.status === "requested").length,
                href: routes.admin.returns,
                icon: "returns",
              },
              {
                label: "Low or out of stock",
                count: lowStock.length,
                href: routes.admin.inventory,
                icon: "stock",
              },
            ]}
          />
        </section>

        <section
          aria-label={`Last ${KPI_DAYS} days`}
          className="grid enter-up grid-cols-2 gap-3 [--enter-delay:80ms] lg:grid-cols-4"
        >
          <StatTile
            label="Revenue"
            value={formatPrice(current.revenue)}
            change={percentChange(current.revenue, previous.revenue)}
            changeLabel={changeLabel}
          />
          <StatTile
            label="Orders"
            value={String(current.orderCount)}
            change={percentChange(current.orderCount, previous.orderCount)}
            changeLabel={changeLabel}
          />
          <StatTile
            label="Average order value"
            value={formatPrice(current.averageOrderValue)}
            change={percentChange(current.averageOrderValue, previous.averageOrderValue)}
            changeLabel={changeLabel}
          />
          <StatTile
            label="Cancelled orders"
            value={String(current.cancelledCount)}
            change={percentChange(current.cancelledCount, previous.cancelledCount)}
            changeLabel={changeLabel}
            upIsGood={false}
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-3">
          <AdminCard
            title="Sales"
            description={`Revenue per day, last ${CHART_DAYS} days. Cancelled and returned orders are left out.`}
            className="reveal xl:col-span-2"
          >
            <SalesChart days={dailySales(orders, now, CHART_DAYS)} />
          </AdminCard>
          <AdminCard
            title="Top products"
            description="By revenue, last 30 days"
            action={{ label: "All products", href: routes.admin.products }}
            className="reveal"
          >
            <TopProducts products={topProducts(orders)} />
          </AdminCard>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <AdminCard
            title="Recent orders"
            action={{ label: "All orders", href: routes.admin.orders }}
            className="reveal xl:col-span-2"
          >
            <RecentOrders orders={orders.slice(0, 6)} />
          </AdminCard>
          <AdminCard
            title="Stock alerts"
            action={{ label: "Inventory", href: routes.admin.inventory }}
            className="reveal"
          >
            <LowStock products={lowStock.slice(0, 6)} />
          </AdminCard>
        </div>
      </div>
    </>
  );
}
