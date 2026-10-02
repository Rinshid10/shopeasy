"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { SaveStatus, type SaveState } from "@/components/admin/SaveStatus";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/ui/icons";
import { setReviewHidden } from "@/lib/admin/actions";
import type { AdminReview } from "@/lib/admin/queries";
import { formatDateTime } from "@/lib/checkout/order-dates";
import { routes } from "@/lib/routes";

type Filter = "all" | "visible" | "hidden";

/** Customer reviews, with a button to hide abusive or fake ones from the shop. */
export function ReviewsList({ reviews: initialReviews }: { reviews: AdminReview[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<Filter>("all");
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const visible = reviews.filter(
    (review) => filter === "all" || (filter === "hidden" ? review.isHidden : !review.isHidden),
  );

  async function toggle(review: AdminReview) {
    const hidden = !review.isHidden;
    setReviews((list) =>
      list.map((item) => (item.id === review.id ? { ...item, isHidden: hidden } : item)),
    );
    setSaveState({ status: "saving" });
    const result = await setReviewHidden(review.id, hidden);
    if (result.ok) {
      setSaveState({
        status: "saved",
        text: hidden ? "Review hidden from the shop." : "Review shown again.",
      });
    } else {
      setReviews((list) =>
        list.map((item) => (item.id === review.id ? { ...item, isHidden: !hidden } : item)),
      );
      setSaveState({ status: "error", error: result.error });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterTabs
        label="Filter reviews"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: "all", label: "All", count: reviews.length },
          { value: "visible", label: "Shown", count: reviews.filter((r) => !r.isHidden).length },
          { value: "hidden", label: "Hidden", count: reviews.filter((r) => r.isHidden).length },
        ]}
      />
      <SaveStatus state={saveState} />
      {visible.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          text="Customers can rate products from My Orders after their order is delivered."
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((review) => (
            <li key={review.id}>
              <Card className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={routes.product(review.productSlug)}
                      className="line-clamp-1 font-semibold text-ink hover:text-brand"
                    >
                      {review.productTitle}
                    </Link>
                    <p className="text-xs text-ink-muted">
                      {review.reviewerName} · order{" "}
                      <Link
                        href={routes.admin.order(review.orderId)}
                        className="text-brand hover:underline"
                      >
                        {review.orderId}
                      </Link>{" "}
                      · {formatDateTime(review.createdAt)}
                    </p>
                  </div>
                  <StatusBadge
                    status={
                      review.isHidden
                        ? { label: "Hidden", tone: "neutral" }
                        : { label: "Shown", tone: "good" }
                    }
                  />
                </div>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-positive px-2 py-0.5 text-xs font-bold text-surface">
                  {review.rating}
                  <StarIcon className="size-3" />
                </span>
                {review.comment ? (
                  <p className="text-sm whitespace-pre-line text-ink">{review.comment}</p>
                ) : (
                  <p className="text-sm text-ink-muted">Rating only, no comment.</p>
                )}
                <Button
                  variant={review.isHidden ? "outline-brand" : "outline"}
                  size="sm"
                  className="mt-auto self-start"
                  onClick={() => void toggle(review)}
                >
                  {review.isHidden ? "Show in shop" : "Hide from shop"}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
