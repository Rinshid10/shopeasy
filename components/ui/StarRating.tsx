import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface StarRatingProps {
  /** Out of 5; parts of a star show partly filled, e.g. 4.2. */
  rating: number;
  className?: string;
}

/** Five gold stars filled to the rating. Pair it with the number, which screen readers read. */
export function StarRating({ rating, className = "size-4" }: StarRatingProps) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.min(Math.max(rating - index, 0), 1);
        return (
          <span key={index} className="relative inline-flex">
            <StarIcon className={cn(className, "text-line")} />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarIcon className={cn(className, "max-w-none text-star")} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
