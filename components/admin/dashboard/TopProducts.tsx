import { ProductImage } from "@/components/product/ProductImage";
import { formatPrice } from "@/lib/format";
import type { ProductSales } from "@/lib/admin/stats";

interface TopProductsProps {
  products: ProductSales[];
}

/** Best sellers by revenue, with a bar showing each one's share against the leader. */
export function TopProducts({ products }: TopProductsProps) {
  const leader = products[0]?.revenue ?? 1;

  return (
    <ol className="flex flex-col gap-3">
      {products.map((product, index) => (
        <li key={product.productSlug} className="flex items-center gap-3">
          <span className="w-4 text-sm font-bold text-ink-muted tabular-nums">{index + 1}</span>
          <div className="w-11 shrink-0">
            <ProductImage product={product} sizes="44px" decorative />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium text-ink">{product.title}</span>
              <span className="text-sm font-bold text-ink tabular-nums">
                {formatPrice(product.revenue)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${(product.revenue / leader) * 100}%` }}
                />
              </span>
              <span className="text-xs text-ink-muted tabular-nums">{product.unitsSold} sold</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
