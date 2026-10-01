import { formatPrice } from "@/lib/format";
import type { PriceSummary } from "@/lib/checkout/pricing";

interface PriceDetailsProps {
  summary: PriceSummary;
}

/** The price breakdown: MRP total, discount, delivery and the amount to pay. */
export function PriceDetails({ summary }: PriceDetailsProps) {
  const itemLabel = `${summary.itemCount} ${summary.itemCount === 1 ? "item" : "items"}`;

  return (
    <section aria-labelledby="price-details-heading" className="flex flex-col gap-3">
      <h2 id="price-details-heading" className="font-bold text-ink">
        Price Details ({itemLabel})
      </h2>
      <dl className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Total Product Price</dt>
          <dd className="text-ink">{formatPrice(summary.totalMrp)}</dd>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Total Discounts</dt>
            <dd className="font-medium text-positive">- {formatPrice(summary.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Delivery Charges</dt>
          <dd className="font-medium text-positive">
            {summary.deliveryCharge === 0 ? "FREE" : formatPrice(summary.deliveryCharge)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-dashed border-line pt-3 text-base">
          <dt className="font-bold text-ink">Order Total</dt>
          <dd className="font-bold text-ink">{formatPrice(summary.total)}</dd>
        </div>
      </dl>
      {summary.discount > 0 && (
        <p className="rounded-lg bg-positive-soft px-3 py-2 text-sm font-semibold text-positive">
          Yay! You are saving {formatPrice(summary.discount)} on this order
        </p>
      )}
    </section>
  );
}
