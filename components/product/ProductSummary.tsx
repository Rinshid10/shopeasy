import { Card } from "@/components/ui/Card";
import { CashIcon, StarIcon, TruckIcon } from "@/components/ui/icons";
import { formatPrice, getDiscountPercent } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types";

/** The id of the page's main Buy Now button, watched by the sticky buy bar on phones. */
export const PRODUCT_MAIN_BUY_BUTTON_ID = "main-buy-button";

interface ProductSummaryProps {
  product: Product;
}

/** The product page's top box, like Meesho's: name, price with discount, rating and delivery. */
export function ProductSummary({ product }: ProductSummaryProps) {
  const { demoStore, store } = siteConfig;
  const discount = getDiscountPercent(product.price, product.mrp);
  // The shop's own customer rating first; otherwise Meesho's, labelled as such.
  const rating =
    product.rating !== undefined
      ? { value: product.rating, count: product.ratingCount, source: undefined }
      : product.meesho
        ? { value: product.meesho.rating, count: product.meesho.ratingCount, source: "Meesho" }
        : null;

  return (
    <Card className="flex flex-col gap-3 p-4 sm:p-5">
      <h1 className="text-base font-medium text-ink-muted sm:text-lg">{product.title}</h1>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-3xl font-bold tracking-tight text-ink">
          {formatPrice(product.price)}
        </span>
        {product.mrp !== undefined && discount !== null && (
          <>
            <span className="text-base text-ink-muted">
              <span className="sr-only">MRP </span>
              <s>{formatPrice(product.mrp)}</s>
            </span>
            <span className="text-base font-semibold text-positive">{discount}% off</span>
          </>
        )}
      </p>
      {rating && (
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-positive px-2.5 py-1 text-sm font-bold text-surface">
            {rating.value.toFixed(1)}
            <StarIcon className="size-3.5" />
            <span className="sr-only">out of 5</span>
          </span>
          <span>
            {rating.count !== undefined &&
              `${rating.count.toLocaleString(siteConfig.locale)} ${rating.count === 1 ? "Rating" : "Ratings"}`}
            {rating.source && ` on ${rating.source}`}
          </span>
        </p>
      )}
      <ul className="flex flex-wrap gap-2 border-t border-line pt-3 text-sm font-medium text-ink">
        {store.deliveryCharge === 0 && (
          <li className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5">
            <TruckIcon className="size-4 text-brand" />
            Free Delivery
          </li>
        )}
        <li className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5">
          <CashIcon className="size-4 text-brand" />
          Cash on Delivery
        </li>
      </ul>
      {demoStore.isEnabled && <p className="text-xs text-ink-muted">{demoStore.catalogueNote}</p>}
    </Card>
  );
}
