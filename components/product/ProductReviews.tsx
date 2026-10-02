import Link from "next/link";
import { ReviewCards, type ReviewCardData } from "@/components/product/ReviewCards";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/ui/icons";
import { StarRating } from "@/components/ui/StarRating";
import type { ReviewSummary } from "@/lib/reviews";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";
import type { MeeshoRatings } from "@/types";

const dateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatReviewDate(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : dateFormatter.format(parsed);
}

interface ProductReviewsProps {
  summary: ReviewSummary;
  /** Rating and reviews from Meesho, labelled as such. */
  meesho?: MeeshoRatings;
}

/**
 * "Reviews & Ratings": the average with a bar per star level, customer photos and review
 * cards. This shop's own reviews come first, marked Verified Purchase; Meesho's are marked
 * as from Meesho buyers. The average is the shop's own once it has reviews, else Meesho's.
 */
export function ProductReviews({ summary, meesho }: ProductReviewsProps) {
  const hasOwn = summary.count > 0;
  const overview = hasOwn
    ? {
        average: summary.average,
        count: summary.count,
        noun: "review",
        // Best first: 5 stars, 4, 3, 2, 1.
        starCounts: ([5, 4, 3, 2, 1] as const).map((stars) => summary.countsByStars[stars]),
        source: undefined,
      }
    : meesho
      ? {
          average: meesho.rating,
          count: meesho.ratingCount ?? meesho.reviews.length,
          noun: "rating",
          starCounts: meesho.starCounts,
          source: "Meesho",
        }
      : null;

  const cards: ReviewCardData[] = [
    ...summary.latest.map((review) => ({
      key: `own-${review.id}`,
      name: review.reviewerName,
      date: formatReviewDate(review.createdAt),
      rating: review.rating,
      comment: review.comment,
      images: [],
      source: "verified" as const,
    })),
    ...(meesho?.reviews ?? [])
      .filter((review) => review.comment || review.images?.length)
      .map((review, index) => ({
        key: `meesho-${index}`,
        name: review.name ?? "Meesho User",
        date: formatReviewDate(review.date),
        rating: review.rating,
        comment: review.comment,
        images: review.images ?? [],
        source: "meesho" as const,
      })),
  ];

  return (
    <Card
      as="section"
      id="reviews"
      aria-labelledby="reviews-heading"
      className="flex scroll-mt-32 flex-col gap-5 p-4 sm:p-6"
    >
      <h2 id="reviews-heading" className="text-lg font-bold text-ink sm:text-xl">
        Reviews &amp; Ratings
      </h2>

      {overview ? (
        <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <RatingOverview {...overview} url={meesho?.url} />
          {cards.length > 0 ? (
            <ReviewCards reviews={cards} />
          ) : (
            <p className="text-sm text-ink-muted">No written reviews yet.</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">No ratings yet.</p>
      )}

      {!hasOwn && (
        <p className="border-t border-line pt-4 text-sm text-ink-muted">
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
  count: number;
  noun: string;
  /** Ratings per star level, best first: [5 stars, 4, 3, 2, 1]. */
  starCounts?: readonly number[];
  /** Where the ratings come from, when not this shop's customers. */
  source?: string;
  url?: string;
}

/** The big average with stars, and a bar per star level with its share of the ratings. */
function RatingOverview({ average, count, noun, starCounts, source, url }: RatingOverviewProps) {
  const total = starCounts?.reduce((sum, value) => sum + value, 0) ?? 0;
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-tint-lavender p-5">
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-center gap-3">
          <span className="text-4xl font-bold text-brand">{average.toFixed(1)}</span>
          <StarRating rating={average} className="size-5" />
          <span className="sr-only">out of 5</span>
        </p>
        <p className="text-xs text-ink-muted">
          ({count.toLocaleString(siteConfig.locale)} {count === 1 ? noun : `${noun}s`}
          {source && (
            <>
              {" on "}
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-semibold text-brand hover:underline"
                >
                  {source}
                </a>
              ) : (
                source
              )}
            </>
          )}
          )
        </p>
      </div>
      {starCounts && total > 0 && (
        <dl className="flex flex-col gap-2.5">
          {starCounts.map((value, index) => {
            const stars = 5 - index;
            const percent = Math.round((value / total) * 100);
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <dt className="flex w-7 shrink-0 items-center gap-0.5 font-semibold text-ink">
                  {stars}
                  <StarIcon className="size-3" />
                  <span className="sr-only"> stars</span>
                </dt>
                <dd className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                    <span
                      className="block h-full rounded-full bg-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-ink-muted tabular-nums">
                    {percent}%
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
