import { ProductCard } from "@/components/product/ProductCard";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
}

/**
 * A grid of product cards, followed by one shared note about prices and affiliate links.
 * The column count follows the width of the space the grid is placed in (2, 4 or 8),
 * so it works in both wide and narrow page layouts.
 */
export function ProductGrid({ products }: ProductGridProps) {
  const { affiliate, demoCatalogue } = siteConfig;

  return (
    <div className="@container flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 @2xl:grid-cols-4 @2xl:gap-4 @[88rem]:grid-cols-8">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">
        {demoCatalogue.isEnabled && `${demoCatalogue.note} `}
        {affiliate.priceNote} {affiliate.buttonsNote}
      </p>
    </div>
  );
}
