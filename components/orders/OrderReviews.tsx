"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { submitReview } from "@/lib/review-actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Order, OrderLine } from "@/types";

const RATING_WORDS = ["", "Poor", "Average", "Good", "Very Good", "Excellent"];

interface SavedReview {
  rating: number;
  comment: string;
}

/** On a delivered order: rate and review each product (Meesho-style stars and a comment). */
export function OrderReviews({ order }: { order: Order }) {
  const [saved, setSaved] = useState<Record<string, SavedReview> | null>(null);

  useEffect(() => {
    let isActive = true;
    void getSupabaseBrowserClient()
      .from("product_reviews")
      .select("rating, comment, products!inner(slug)")
      .eq("order_id", order.id)
      .then(({ data }) => {
        if (!isActive) return;
        setSaved(
          Object.fromEntries(
            (data ?? []).map((row) => [
              row.products.slug,
              { rating: row.rating, comment: row.comment },
            ]),
          ),
        );
      });
    return () => {
      isActive = false;
    };
  }, [order.id]);

  if (!saved) return null;

  return (
    <Card as="section" aria-labelledby="rate-heading" className="flex flex-col gap-4 p-4 sm:p-5">
      <h2 id="rate-heading" className="font-bold text-ink">
        Rate your products
      </h2>
      <ul className="flex flex-col divide-y divide-line">
        {order.lines.map((line) => (
          <li key={line.productSlug} className="py-4 first:pt-0 last:pb-0">
            <ReviewForm orderId={order.id} line={line} saved={saved[line.productSlug]} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

interface ReviewFormProps {
  orderId: string;
  line: OrderLine;
  saved?: SavedReview;
}

function ReviewForm({ orderId, line, saved }: ReviewFormProps) {
  const [rating, setRating] = useState(saved?.rating ?? 0);
  const [comment, setComment] = useState(saved?.comment ?? "");
  const [isEditing, setIsEditing] = useState(!saved);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  async function save() {
    if (rating === 0) {
      setMessage({ tone: "bad", text: "Tap the stars to choose a rating." });
      return;
    }
    setIsSaving(true);
    setMessage(null);
    const result = await submitReview({
      orderId,
      productSlug: line.productSlug,
      rating,
      comment,
    });
    setIsSaving(false);
    if (result.ok) {
      setIsEditing(false);
      setMessage({ tone: "good", text: "Thanks! Your review is saved." });
    } else {
      setMessage({ tone: "bad", text: result.error });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-ink">{line.title}</p>
      {isEditing ? (
        <>
          <div role="radiogroup" aria-label={`Rating for ${line.title}`} className="flex gap-1">
            {[1, 2, 3, 4, 5].map((stars) => (
              <button
                key={stars}
                type="button"
                role="radio"
                aria-checked={rating === stars}
                aria-label={`${stars} ${stars === 1 ? "star" : "stars"}: ${RATING_WORDS[stars]}`}
                onClick={() => setRating(stars)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg border",
                  stars <= rating
                    ? "border-positive bg-positive text-surface"
                    : "border-line text-ink-soft hover:border-ink-muted",
                )}
              >
                <StarIcon className="size-5" />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 self-center text-sm font-medium text-ink">
                {RATING_WORDS[rating]}
              </span>
            )}
          </div>
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            Your review (optional)
            <textarea
              rows={3}
              maxLength={1000}
              value={comment}
              placeholder="What did you like or dislike?"
              onChange={(event) => setComment(event.target.value)}
              className="rounded-xl border border-line bg-surface px-3.5 py-3 text-base text-ink placeholder:text-ink-soft focus:border-brand"
            />
          </label>
          <Button variant="buy" className="self-start" disabled={isSaving} onClick={save}>
            {isSaving ? "Saving…" : saved ? "Update Review" : "Submit Review"}
          </Button>
        </>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-positive px-2.5 py-0.5 text-sm font-bold text-surface">
              {rating}
              <StarIcon className="size-3.5" />
            </span>
            {comment && <p className="text-sm text-ink">{comment}</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setMessage(null);
            }}
            className="shrink-0 text-sm font-semibold text-brand hover:underline"
          >
            Edit
          </button>
        </div>
      )}
      {message && (
        <p
          role="status"
          className={cn("text-sm", message.tone === "good" ? "text-positive" : "text-negative")}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
