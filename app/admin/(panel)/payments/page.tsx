import { AdminCard } from "@/components/admin/AdminCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatShortDate } from "@/lib/checkout/order-dates";
import { payoutStatusDisplay } from "@/lib/admin/labels";
import { getAdminOrders, getPayouts } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const [orders, payouts] = await Promise.all([getAdminOrders(), getPayouts()]);
  const sum = (status: string) =>
    orders
      .filter((order) => order.paymentStatus === status)
      .reduce((total, order) => total + order.total, 0);
  const awaitingPayout = payouts
    .filter((payout) => payout.status === "processing")
    .reduce((total, payout) => total + payout.amount, 0);

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Cash on delivery: the courier collects from customers and pays it on to you each week."
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Collected (delivered)" value={formatPrice(sum("collected"))} />
        <StatTile label="Still to collect" value={formatPrice(sum("pending"))} />
        <StatTile label="Next payout" value={formatPrice(awaitingPayout)} />
        <StatTile label="Refunded" value={formatPrice(sum("refunded"))} />
      </div>
      <AdminCard
        title="Payouts"
        description="Weekly transfers of cash collected for delivered orders."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs text-ink-muted">
              <tr>
                <th className="py-2 pr-4 font-semibold">Payout</th>
                <th className="py-2 pr-4 font-semibold">Week</th>
                <th className="py-2 pr-4 text-right font-semibold">Orders</th>
                <th className="py-2 pr-4 text-right font-semibold">Amount</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="py-3 pr-4 font-semibold text-ink">{payout.id}</td>
                  <td className="py-3 pr-4 text-ink-muted">
                    {formatShortDate(payout.periodStart)} – {formatShortDate(payout.periodEnd)}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{payout.orderCount}</td>
                  <td className="py-3 pr-4 text-right font-bold text-ink tabular-nums">
                    {formatPrice(payout.amount)}
                  </td>
                  <td className="py-3">
                    <span className="flex flex-col items-start gap-0.5">
                      <StatusBadge status={payoutStatusDisplay[payout.status]} />
                      {payout.paidAt && (
                        <span className="text-xs text-ink-muted">
                          on {formatShortDate(payout.paidAt)}
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </>
  );
}
