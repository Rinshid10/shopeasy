"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckIcon, StarIcon } from "@/components/ui/icons";
import { StarRating } from "@/components/ui/StarRating";

/** One review card, from this shop's customers or from Meesho. */
export interface ReviewCardData {
  key: string;
  name: string;
  /** Already formatted, e.g. "12 May 2025". */
  date: string;
  rating: number;
  comment: string;
  images: string[];
  /** "verified" for this shop's delivered orders; "meesho" for reviews copied from Meesho. */
  source: "verified" | "meesho";
}

/** How many review cards show before "View all reviews". */
const FIRST_SHOWN = 3;

/** Avatar colours, picked by the reviewer's name so each keeps the same one. */
const AVATAR_COLOURS = [
  "bg-tint-lavender text-violet-ink",
  "bg-tint-pink text-brand",
  "bg-tint-mint text-teal",
  "bg-tint-peach text-orange",
  "bg-tint-sky text-info",
];

function avatarColour(name: string): string {
  const sum = [...name].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return AVATAR_COLOURS[sum % AVATAR_COLOURS.length];
}

/** Customer photos, then the review cards three across, with "View all reviews". */
export function ReviewCards({ reviews }: { reviews: ReviewCardData[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? reviews : reviews.slice(0, FIRST_SHOWN);
  const photos = reviews.flatMap((review) =>
    review.images.map((url) => ({ url, name: review.name })),
  );

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {photos.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-ink">Customer Photos</h3>
          <ul className="relative scrollbar-none flex gap-2 overflow-x-auto">
            {photos.slice(0, 10).map((photo, index) => (
              <li key={`${photo.url}-${index}`} className="shrink-0">
                <PhotoLink url={photo.url} label={`Photo from ${photo.name}`} size={64} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((review) => (
          <li
            key={review.key}
            className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColour(review.name)}`}
              >
                {review.name.charAt(0).toUpperCase()}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-ink">{review.name}</span>
                {review.date && <span className="text-xs text-ink-muted">{review.date}</span>}
              </span>
            </div>
            <p className="flex items-center gap-2 text-xs text-ink-muted">
              <StarRating rating={review.rating} className="size-3.5" />
              <span>
                ({review.rating})<span className="sr-only"> out of 5 stars</span>
              </span>
            </p>
            {review.comment && <p className="text-sm leading-relaxed text-ink">{review.comment}</p>}
            {review.images.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {review.images.map((url, index) => (
                  <li key={url}>
                    <PhotoLink
                      url={url}
                      label={`Photo ${index + 1} from ${review.name}'s review`}
                      size={56}
                    />
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-ink-muted">
              {review.source === "verified" ? (
                <>
                  <CheckIcon className="size-4 rounded-full bg-brand p-0.5 text-surface" />
                  Verified Purchase
                </>
              ) : (
                <>
                  <StarIcon className="size-4 text-ink-soft" />
                  Meesho buyer
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
      {!showAll && reviews.length > FIRST_SHOWN && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-fit text-sm font-semibold text-brand hover:underline"
        >
          View all reviews ({reviews.length}) →
        </button>
      )}
    </div>
  );
}

function PhotoLink({ url, label, size }: { url: string; label: string; size: number }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="block overflow-hidden rounded-lg border border-line hover:border-brand"
    >
      <Image
        src={url}
        alt={label}
        width={size}
        height={size}
        sizes={`${size}px`}
        className="object-cover"
        style={{ width: size, height: size }}
      />
    </a>
  );
}
