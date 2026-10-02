import { BuyNowButton } from "@/components/product/BuyNowButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductRating } from "@/components/product/ProductRating";
import { Badge } from "@/components/ui/Badge";
import { CashIcon, TruckIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types";

/** The id of the page's main buy buttons, watched by the sticky buy bar on phones. */
export const PRODUCT_MAIN_BUY_BUTTON_ID = "main-buy-button";

interface ProductSummaryProps {
  product: Product;
}

/** The title, price and buy buttons shown beside the main image on a product page. */
export function ProductSummary({ product }: ProductSummaryProps) {
  const { demoStore, store } = siteConfig;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{product.brand}</Badge>
          {product.isTopPick && <Badge variant="highlight">Top pick</Badge>}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {product.title}
        </h1>
        {product.rating !== undefined && (
          <ProductRating rating={product.rating} count={product.ratingCount} />
        )}
        <p className="text-ink-muted sm:text-lg">{product.shortDescription}</p>
      </div>
      <div className="flex flex-col gap-3">
        <ProductPrice price={product.price} mrp={product.mrp} size="lg" />
        <ul className="flex flex-wrap gap-2 text-sm font-medium text-ink">
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
        {demoStore.isEnabled && <p className="text-sm text-ink-muted">{demoStore.catalogueNote}</p>}
      </div>
      <div id={PRODUCT_MAIN_BUY_BUTTON_ID} className="sm:max-w-xs">
        <BuyNowButton productSlug={product.slug} productTitle={product.title} size="lg" />
      </div>
    </div>
  );
}
