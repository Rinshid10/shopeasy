import { StarIcon } from "@/components/ui/icons";
import { formatCount } from "@/lib/format";

interface ProductRatingProps {
  rating: number;
  /** How many ratings the average is based on. */
  count?: number;
}

/** A green badge with the average rating out of 5, followed by the number of ratings. */
export function ProductRating({ rating, count }: ProductRatingProps) {
  return (
    <p className="flex items-center gap-1.5 text-xs">
      <span className="inline-flex items-center gap-0.5 rounded bg-positive px-1.5 py-0.5 leading-none font-semibold text-surface">
        <StarIcon className="size-3" />
        <span className="sr-only">Rated</span>
        {rating.toFixed(1)}
        <span className="sr-only">out of 5</span>
      </span>
      {count !== undefined && (
        <span className="text-ink-muted">
          ({formatCount(count)}
          <span className="sr-only"> ratings</span>)
        </span>
      )}
    </p>
  );
}
