import { AffiliateButton } from "@/components/product/AffiliateButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductRating } from "@/components/product/ProductRating";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types";

interface ProductSummaryProps {
  product: Product;
}

/** The title, price and buy button shown beside the main image on a product page. */
export function ProductSummary({ product }: ProductSummaryProps) {
  const { affiliate, demoCatalogue } = siteConfig;

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
      <div>
        <ProductPrice price={product.price} mrp={product.mrp} size="lg" />
        <p className="mt-1 text-sm text-ink-muted">
          {affiliate.priceNote} Last checked on {formatDate(product.priceCheckedOn)}.
        </p>
        {demoCatalogue.isEnabled && (
          <p className="mt-1 text-sm text-ink-muted">{demoCatalogue.note}</p>
        )}
      </div>
      <div className="sm:max-w-sm">
        <AffiliateButton href={product.affiliateUrl} productTitle={product.title} size="lg" />
      </div>
    </div>
  );
}
