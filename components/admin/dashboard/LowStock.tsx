import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getStockLevel, stockLevelDisplay } from "@/lib/admin/labels";
import type { AdminProduct } from "@/lib/admin/queries";
import { routes } from "@/lib/routes";

interface LowStockProps {
  products: AdminProduct[];
}

/** Products that are out of stock or running low, emptiest first. */
export function LowStock({ products }: LowStockProps) {
  if (products.length === 0) {
    return <p className="text-sm text-ink-muted">Everything is well stocked.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {products.map((product) => (
        <li key={product.slug}>
          <Link
            href={routes.admin.product(product.slug)}
            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-muted"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-ink">{product.title}</span>
              <span className="text-xs text-ink-muted">{product.inventory.sku}</span>
            </span>
            <span className="text-sm font-bold text-ink tabular-nums">
              {product.inventory.stock} left
            </span>
            <StatusBadge
              status={
                stockLevelDisplay[
                  getStockLevel(product.inventory.stock, product.inventory.lowStockThreshold)
                ]
              }
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
