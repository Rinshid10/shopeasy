"use client";

import { useState, type ReactNode } from "react";

/** How many reviews show before "View all reviews". */
const FIRST_SHOWN = 5;

/** A list of reviews: the first five, then the rest after "View all reviews". */
export function ReviewList({ items }: { items: ReactNode[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? items : items.slice(0, FIRST_SHOWN);
  return (
    <div className="flex flex-col border-t border-line">
      <ul className="flex flex-col divide-y divide-line">{shown}</ul>
      {!showAll && items.length > FIRST_SHOWN && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 rounded-lg border border-line py-2.5 text-sm font-semibold text-brand hover:bg-surface-muted"
        >
          View all reviews ({items.length})
        </button>
      )}
    </div>
  );
}
