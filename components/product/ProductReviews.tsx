import Image from "next/image";
import Link from "next/link";
import { ReviewList } from "@/components/product/ReviewList";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/checkout/order-dates";
import type { ReviewSummary } from "@/lib/reviews";
import { routes } from "@/lib/routes";
import type { MeeshoRatings } from "@/types";

/** Star levels as Meesho names and colours them, best first. */
const LEVELS = [
  { stars: 5, label: "Excellent", bar: "bg-positive" },
  { stars: 4, label: "Very Good", bar: "bg-positive" },
  { stars: 3, label: "Good", bar: "bg-rating-good" },
  { stars: 2, label: "Average", bar: "bg-rating-average" },
  { stars: 1, label: "Poor", bar: "bg-rating-poor" },
] as const;

const formatNumber = (value: number) => value.toLocaleString("en-IN");

interface ProductReviewsProps {
  summary: ReviewSummary;
  /** Rating and reviews from Meesho, shown in their own labelled section. */
  meesho?: MeeshoRatings;
}

/**
 * Meesho-style "Product Ratings & Reviews" box: this shop's own customer reviews and any
 * attached Meesho rating and reviews, clearly labelled as from Meesho buyers. Whichever has
 * ratings comes first.
 */
export function ProductReviews({ summary, meesho }: ProductReviewsProps) {
  const hasOwn = summary.count > 0;
  return (
    <Card as="section" aria-labelledby="reviews-heading" className="flex flex-col gap-4 p-4 sm:p-5">
      <h2 id="reviews-heading" className="text-lg font-bold text-ink">
        Product Ratings &amp; Reviews
      </h2>
      {hasOwn && <OwnReviews summary={summary} />}
      {meesho && <MeeshoReviews meesho={meesho} separated={hasOwn} />}
      {!hasOwn && (
        <p className={cn("text-sm text-ink-muted", meesho && "border-t border-line pt-4")}>
          No reviews from our customers yet. Bought this product? Rate it from{" "}
          <Link href={routes.orders} className="font-semibold text-brand hover:underline">
            My Orders
          </Link>{" "}
          once it&apos;s delivered.
        </p>
      )}
    </Card>
  );
}

interface RatingOverviewProps {
  average: number;
  ratingCount: number;
  reviewCount?: number;
  /** Ratings per star level, best first: [5 stars, 4, 3, 2, 1]. */
  starCounts?: readonly number[];
}

/** The big average on the left and, when known, one bar per star level on the right. */
function RatingOverview({ average, ratingCount, reviewCount, starCounts }: RatingOverviewProps) {
  const barTotal = starCounts?.reduce((sum, count) => sum + count, 0) ?? 0;
  return (
    <div className="flex items-center gap-5 sm:gap-8">
      <div className="flex shrink-0 flex-col gap-1">
        <p className="flex items-center gap-1 text-4xl font-bold text-positive">
          {average.toFixed(1)}
          <StarIcon className="size-6" />
          <span className="sr-only">out of 5</span>
        </p>
        <p className="text-xs text-ink-muted">
          {formatNumber(ratingCount)} {ratingCount === 1 ? "Rating" : "Ratings"}
          {reviewCount !== undefined && (
            <>
              ,<br />
              {formatNumber(reviewCount)} {reviewCount === 1 ? "Review" : "Reviews"}
            </>
          )}
        </p>
      </div>
      {starCounts && barTotal > 0 && (
        <dl className="flex min-w-0 flex-1 flex-col gap-2">
          {LEVELS.map((level, index) => {
            const count = starCounts[index] ?? 0;
            return (
              <div key={level.stars} className="flex items-center gap-3 text-xs">
                <dt className="w-16 shrink-0 text-right font-medium text-ink">{level.label}</dt>
                <dd className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className={cn("block h-full rounded-full", level.bar)}
                      style={{ width: `${(count / barTotal) * 100}%` }}
                    />
                  </span>
                  <span className="w-12 shrink-0 text-ink-muted tabular-nums">
                    {formatNumber(count)}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}

/** Ratings and reviews from this shop's own customers. */
function OwnReviews({ summary }: { summary: ReviewSummary }) {
  return (
    <>
      <RatingOverview
        average={summary.average}
        ratingCount={summary.count}
        starCounts={LEVELS.map((level) => summary.countsByStars[level.stars])}
      />
      {summary.latest.length > 0 && (
        <ReviewList
          items={summary.latest.map((review) => (
            <li key={review.id} className="flex flex-col gap-2 py-4 last:pb-0">
              <p className="text-sm font-medium text-ink">{review.reviewerName}</p>
              <p className="flex items-center gap-2 text-xs text-ink-muted">
                <RatingChip rating={review.rating} />
                Posted on {formatShortDate(review.createdAt)}
              </p>
              <p className="text-sm whitespace-pre-line text-ink">{review.comment}</p>
            </li>
          ))}
        />
      )}
    </>
  );
}

/** Ratings and reviews from Meesho buyers, labelled so customers know where they come from. */
function MeeshoReviews({ meesho, separated }: { meesho: MeeshoRatings; separated: boolean }) {
  const reviews = meesho.reviews.filter((review) => review.comment || review.images?.length);
  return (
    <section
      aria-labelledby="meesho-reviews-heading"
      className={cn("flex flex-col gap-4", separated && "border-t border-line pt-4")}
    >
      <h3 id="meesho-reviews-heading" className="text-sm font-semibold text-ink-muted">
        From Meesho buyers, on{" "}
        {meesho.url ? (
          <a
            href={meesho.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-brand hover:underline"
          >
            Meesho
          </a>
        ) : (
          "Meesho"
        )}
      </h3>
      <RatingOverview
        average={meesho.rating}
        ratingCount={meesho.ratingCount ?? reviews.length}
        reviewCount={meesho.reviewCount}
        starCounts={meesho.starCounts}
      />
      {reviews.length > 0 && (
        <ReviewList
          items={reviews.map((review, index) => (
            <li key={index} className="flex flex-col gap-2 py-4 last:pb-0">
              <p className="text-sm font-medium text-ink">{review.name ?? "Meesho User"}</p>
              <p className="flex items-center gap-2 text-xs text-ink-muted">
                <RatingChip rating={review.rating} />
                {review.date && `Posted on ${formatShortDate(review.date)}`}
              </p>
              <p className="text-sm text-ink">{review.comment}</p>
              {review.images && review.images.length > 0 && (
                <ReviewPhotos images={review.images} reviewer={review.name ?? "Meesho User"} />
              )}
            </li>
          ))}
        />
      )}
    </section>
  );
}

/** Thumbnails of the photos a buyer attached; each opens full size in a new tab. */
function ReviewPhotos({ images, reviewer }: { images: string[]; reviewer: string }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {images.map((url, index) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block overflow-hidden rounded-lg border border-line hover:border-brand"
          >
            <Image
              src={url}
              alt={`Photo ${index + 1} from ${reviewer}'s review`}
              width={72}
              height={72}
              sizes="72px"
              className="size-18 object-cover"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** A small green "4 ★" chip for one review. */
function RatingChip({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-positive px-2 py-0.5 text-xs font-bold text-surface">
      {rating.toFixed(1)}
      <StarIcon className="size-3" />
      <span className="sr-only">out of 5</span>
    </span>
  );
}
