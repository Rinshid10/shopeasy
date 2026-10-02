"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { TextInput } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import { StarIcon } from "@/components/ui/icons";
import {
  checkMeeshoReviewResearch,
  startMeeshoReviewResearch,
  type MeeshoReviewResearch,
} from "@/lib/admin/meesho-review-actions";
import type { MeeshoRatings } from "@/types";

const CHECK_EVERY_MS = 4000;
const GIVE_UP_AFTER_MS = 3 * 60 * 1000;

interface MeeshoReviewsCardProps {
  /** The product name in the form; the search follows it until the admin edits the search. */
  productTitle: string;
  /** Lets the form start a lookup itself, e.g. right after a Meesho link import. */
  ref?: Ref<MeeshoReviewsHandle>;
  /** The Meesho rating and reviews currently set to show on the product page. */
  attached: MeeshoRatings | null;
  /** Shows the fetched reviews on the product page (saved with the product). */
  onAttach: (research: MeeshoReviewResearch) => void;
  /** Stops showing Meesho ratings and reviews on the product page. */
  onDetach: () => void;
}

export interface MeeshoReviewsHandle {
  /** Looks up Meesho reviews for this product name. */
  fetchFor: (productName: string) => void;
}

/**
 * What Meesho buyers say about the product. The rating and reviews are attached to the
 * product and shown on its page, labelled as from Meesho and without buyers' names.
 */
export function MeeshoReviewsCard({
  productTitle,
  ref,
  attached,
  onAttach,
  onDetach,
}: MeeshoReviewsCardProps) {
  const [editedSearch, setEditedSearch] = useState<string | null>(null);
  const search = editedSearch ?? productTitle;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [research, setResearch] = useState<MeeshoReviewResearch | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isLoadingRef = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  useImperativeHandle(ref, () => ({
    fetchFor(productName: string) {
      if (productName.trim().length < 3) return;
      setEditedSearch(null);
      void fetchReviews(productName);
    },
  }));

  async function fetchReviews(query: string = search) {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);
    setResearch(null);
    const finish = () => {
      isLoadingRef.current = false;
      setIsLoading(false);
    };
    const started = await startMeeshoReviewResearch(query);
    if (!started.ok) {
      finish();
      setError(started.error);
      return;
    }
    const startedAt = Date.now();
    const check = async () => {
      const result = await checkMeeshoReviewResearch(started.data.runId);
      if (result.ok && result.data.status === "running") {
        if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
          finish();
          setError("Meesho took too long to answer. Try again.");
          return;
        }
        timer.current = setTimeout(check, CHECK_EVERY_MS);
        return;
      }
      finish();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.data.status === "done") {
        setResearch(result.data.research);
        onAttach(result.data.research);
      }
    };
    timer.current = setTimeout(check, CHECK_EVERY_MS);
  }

  return (
    <AdminCard
      title="Meesho reviews (research)"
      description="What Meesho buyers say about this product. Fetched automatically after a Meesho link import, or tap Fetch reviews. The rating and reviews show on the product page labelled as from Meesho, without buyers' names. About 2 cents of Apify credit each."
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="meesho-review-search" className="sr-only">
          Product name to search on Meesho
        </label>
        <TextInput
          id="meesho-review-search"
          value={search}
          disabled={isLoading}
          onChange={(event) => setEditedSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void fetchReviews();
            }
          }}
        />
        <Button
          variant="outline-brand"
          className="shrink-0"
          disabled={isLoading || search.trim().length < 3}
          onClick={() => void fetchReviews()}
        >
          {isLoading ? "Fetching…" : "Fetch reviews"}
        </Button>
      </div>
      {isLoading && (
        <p className="rounded-xl bg-surface-muted p-3 text-sm text-ink-muted">
          Searching Meesho… this can take up to a minute.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm text-negative">
          {error}
        </p>
      )}
      {attached && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-positive-soft p-3 text-sm text-positive">
          <p>
            Shown on the product page, labelled &ldquo;on Meesho&rdquo;:{" "}
            {attached.rating.toFixed(1)}★
            {attached.ratingCount !== undefined &&
              ` · ${attached.ratingCount.toLocaleString("en-IN")} ratings`}
            {` · ${attached.reviews.length} reviews`}. Saved when you tap Save.
          </p>
          <button
            type="button"
            onClick={onDetach}
            className="font-semibold text-negative hover:underline"
          >
            Don&apos;t show in shop
          </button>
        </div>
      )}
      {research && <ResearchResult research={research} />}
    </AdminCard>
  );
}

function ResearchResult({ research }: { research: MeeshoReviewResearch }) {
  const counts = [5, 4, 3, 2, 1].map(
    (stars) =>
      [stars, research.reviews.filter((review) => review.rating === stars).length] as const,
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink">
        Matched on Meesho:{" "}
        {research.matchedUrl ? (
          <a
            href={research.matchedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand hover:underline"
          >
            {research.matchedName}
          </a>
        ) : (
          <span className="font-semibold">{research.matchedName}</span>
        )}
      </p>
      <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        {research.averageRating !== null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-positive px-2.5 py-0.5 font-bold text-surface">
            {research.averageRating.toFixed(1)}
            <StarIcon className="size-3.5" />
          </span>
        )}
        {research.ratingCount !== null && (
          <span>{research.ratingCount.toLocaleString("en-IN")} ratings on Meesho</span>
        )}
        <span>
          · in these {research.reviews.length} reviews:{" "}
          {counts.map(([stars, count]) => `${stars}★ ${count}`).join(", ")}
        </span>
      </p>
      {research.reviews.length === 0 ? (
        <p className="text-sm text-ink-muted">No written reviews came back for this product.</p>
      ) : (
        <ul className="flex max-h-96 flex-col divide-y divide-line overflow-y-auto rounded-xl border border-line">
          {research.reviews.map((review, index) => (
            <li key={index} className="flex flex-col gap-1 p-3">
              <p className="flex items-center gap-2 text-xs text-ink-muted">
                <span
                  className={
                    review.rating >= 4
                      ? "rounded-full bg-positive px-2 py-0.5 font-bold text-surface"
                      : review.rating === 3
                        ? "rounded-full bg-warning px-2 py-0.5 font-bold text-surface"
                        : "rounded-full bg-negative px-2 py-0.5 font-bold text-surface"
                  }
                >
                  {review.rating}★
                </span>
                <span className="font-medium text-ink">{review.name}</span>
                {review.date && ` · ${review.date.slice(0, 10)}`}
                {review.helpful > 0 && ` · ${review.helpful} found helpful`}
              </p>
              {review.comment ? (
                <p className="text-sm text-ink">{review.comment}</p>
              ) : (
                <p className="text-sm text-ink-muted">Rating only.</p>
              )}
              {review.images.length > 0 && (
                <p className="text-xs text-ink-muted">
                  {review.images.length} {review.images.length === 1 ? "photo" : "photos"}, shown on
                  the product page
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
