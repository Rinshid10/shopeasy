import { AffiliateButton } from "@/components/product/AffiliateButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Product } from "@/types";

interface ProductSummaryProps {
  product: Product;
}

/** The title, price and buy button shown beside the main image on a product page. */
export function ProductSummary({ product }: ProductSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <Badge>{product.brand}</Badge>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{product.title}</h1>
        <p className="text-ink-muted">{product.shortDescription}</p>
      </div>
      <div>
        <ProductPrice price={product.price} size="lg" />
        <p className="mt-1 text-sm text-ink-muted">
          Indicative price, last checked on {formatDate(product.priceCheckedOn)}.
        </p>
      </div>
      <div className="sm:max-w-xs">
        <AffiliateButton href={product.affiliateUrl} productTitle={product.title} size="lg" />
      </div>
    </div>
  );
}
