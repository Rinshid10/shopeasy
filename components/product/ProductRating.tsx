import { StarRating } from "@/components/ui/StarRating";
import { formatCount } from "@/lib/format";

interface ProductRatingProps {
  rating: number;
  /** How many ratings the average is based on. */
  count?: number;
  /** Where the rating comes from, when it isn't this shop's customers, e.g. "Meesho". */
  source?: string;
}

/** Gold stars with the average out of 5, then the number of ratings, for product cards. */
export function ProductRating({ rating, count, source }: ProductRatingProps) {
  return (
    <p className="flex flex-wrap items-center gap-1 text-xs text-ink-muted">
      <StarRating rating={rating} className="size-3.5" />
      <span className="font-semibold text-ink">
        {rating.toFixed(1)}
        <span className="sr-only"> out of 5</span>
      </span>
      {count !== undefined && (
        <span>
          ({formatCount(count)}
          <span className="sr-only"> ratings</span>
          {source && ` on ${source}`})
        </span>
      )}
      {count === undefined && source && <span>on {source}</span>}
    </p>
  );
}
