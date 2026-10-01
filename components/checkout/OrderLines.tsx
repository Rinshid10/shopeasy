import { ProductImage } from "@/components/product/ProductImage";
import { formatPrice } from "@/lib/format";
import type { OrderLine } from "@/types";

interface OrderLinesProps {
  lines: Pick<OrderLine, "productSlug" | "title" | "imageUrl" | "price" | "quantity">[];
}

/** A read-only list of ordered products with quantity and line total. */
export function OrderLines({ lines }: OrderLinesProps) {
  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => (
        <li key={line.productSlug} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="w-16 shrink-0">
            <ProductImage product={line} sizes="64px" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="line-clamp-2 text-sm font-medium text-ink">{line.title}</p>
            <p className="text-sm text-ink-muted">Qty: {line.quantity}</p>
          </div>
          <p className="text-sm font-semibold text-ink">
            {formatPrice(line.price * line.quantity)}
          </p>
        </li>
      ))}
    </ul>
  );
}
