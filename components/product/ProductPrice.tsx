import { cn } from "@/lib/cn";
import { formatPrice, getDiscountPercent } from "@/lib/format";

interface ProductPriceProps {
  price: number;
  /** The listed MRP. Shown struck through, with the discount, when it is above the price. */
  mrp?: number;
  /** "md" for cards, "lg" for larger spots; both keep the discount beside the price. */
  size?: "md" | "lg";
}

/** An indicative price. Always pair it with the "price may change" note nearby. */
export function ProductPrice({ price, mrp, size = "md" }: ProductPriceProps) {
  const discountPercent = getDiscountPercent(price, mrp);
  const isLarge = size === "lg";

  return (
    <div className={cn("flex flex-wrap items-center gap-y-1", isLarge ? "gap-x-3" : "gap-x-2")}>
      <p className="flex items-baseline gap-2">
        <span
          className={cn(
            "tracking-tight text-ink",
            isLarge ? "text-4xl font-extrabold" : "text-base font-bold",
          )}
        >
          {formatPrice(price)}
        </span>
        {mrp !== undefined && discountPercent !== null && (
          <span className={cn("text-ink-muted", isLarge ? "text-lg" : "text-xs")}>
            <span className="sr-only">MRP </span>
            <s>{formatPrice(mrp)}</s>
          </span>
        )}
      </p>
      {discountPercent !== null && (
        <p className="rounded bg-positive-soft px-1.5 py-0.5 text-[11px] leading-tight font-semibold text-positive">
          {discountPercent}% OFF
        </p>
      )}
    </div>
  );
}
