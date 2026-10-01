import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { describeOrderStatus } from "@/lib/checkout/order-dates";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Order } from "@/types";

const MAX_PREVIEW_IMAGES = 3;

interface OrderCardProps {
  order: Order;
}

/** One order in the My Orders list: pictures, what was ordered, status and total. */
export function OrderCard({ order }: OrderCardProps) {
  const [firstLine, ...otherLines] = order.lines;
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const isCancelled = order.status === "cancelled";

  return (
    <Link
      href={routes.orderDetails(order.id)}
      className="group flex pressable reveal items-center gap-3 rounded-2xl border border-line bg-surface p-3 hover:border-brand/30 hover:shadow-lg sm:gap-4 sm:p-4"
    >
      <div className="flex shrink-0 -space-x-6">
        {order.lines.slice(0, MAX_PREVIEW_IMAGES).map((line) => (
          <div
            key={line.productSlug}
            className={cn(
              "w-16 rounded-xl ring-2 ring-surface sm:w-20",
              isCancelled && "opacity-60 grayscale",
            )}
          >
            <ProductImage product={line} sizes="80px" decorative />
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className={cn("text-sm font-semibold", isCancelled ? "text-ink-muted" : "text-positive")}
        >
          {describeOrderStatus(order)}
        </p>
        <p className="line-clamp-1 text-sm font-medium text-ink group-hover:text-brand">
          {firstLine?.title}
          {otherLines.length > 0 && ` + ${otherLines.length} more`}
        </p>
        <p className="text-xs text-ink-muted">
          {itemCount} {itemCount === 1 ? "item" : "items"} · {formatPrice(order.total)} · Order{" "}
          {order.id}
        </p>
      </div>
      <ChevronRightIcon className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
