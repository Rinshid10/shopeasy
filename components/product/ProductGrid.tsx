import { ProductCard } from "@/components/product/ProductCard";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  /** How many of the first cards load their pictures at once: those in the first screen. */
  eagerCount?: number;
}

/**
 * A grid of product cards, followed by the demo-store note while it is turned on.
 * The column count follows the width of the space the grid is placed in (2, 4 or 8),
 * so it works in both wide and narrow page layouts.
 */
export function ProductGrid({ products, eagerCount = 0 }: ProductGridProps) {
  const { demoStore } = siteConfig;

  return (
    <div className="@container flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 @2xl:grid-cols-4 @2xl:gap-4 @[88rem]:grid-cols-8">
        {products.map((product, index) => (
          <li key={product.slug}>
            <ProductCard product={product} eager={index < eagerCount} />
          </li>
        ))}
      </ul>
      {demoStore.isEnabled && <p className="text-xs text-ink-muted">{demoStore.catalogueNote}</p>}
    </div>
  );
}
