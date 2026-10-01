import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";

/** The price points offered as "Under ₹…" shortcuts, cheapest first. */
export const PRICE_TILE_LIMITS = [499, 999, 1999, 4999];

const TILE_STYLES = [
  "bg-tint-pink text-brand-strong",
  "bg-tint-cream text-amber-ink",
  "bg-tint-mint text-teal",
  "bg-tint-lavender text-violet-ink",
];

interface PriceTilesProps {
  /** How many products are at or below each price, so empty price points are skipped. */
  counts: Record<number, number>;
}

/** Budget shortcuts: each tile opens the products at or below its price. */
export function PriceTiles({ counts }: PriceTilesProps) {
  const limits = PRICE_TILE_LIMITS.filter((limit) => (counts[limit] ?? 0) > 0);

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {limits.map((limit, index) => (
        <li key={limit}>
          <Link
            href={routes.searchUnder(limit)}
            className={cn(
              "group flex h-full pressable flex-col items-center justify-center gap-0.5 rounded-3xl border-2 border-dashed border-current/25 px-3 py-5 text-center hover:-translate-y-1 hover:shadow-lg sm:py-6",
              TILE_STYLES[index % TILE_STYLES.length],
            )}
          >
            <span className="text-xs font-semibold tracking-widest uppercase opacity-80">
              Under
            </span>
            <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {formatPrice(limit)}
            </span>
            <span className="text-xs font-medium text-ink-muted">
              {counts[limit]} {counts[limit] === 1 ? "product" : "products"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
