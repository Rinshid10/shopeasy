import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

interface ProductPriceProps {
  price: number;
  size?: "md" | "lg";
}

/** An indicative price, always shown with the note that it may change. */
export function ProductPrice({ price, size = "md" }: ProductPriceProps) {
  return (
    <div>
      <p className={cn("font-bold text-ink", size === "lg" ? "text-3xl" : "text-lg")}>
        {formatPrice(price)}
      </p>
      <p className={cn("text-ink-muted", size === "lg" ? "mt-1 text-sm" : "text-xs")}>
        {siteConfig.affiliate.priceNote}
      </p>
    </div>
  );
}
