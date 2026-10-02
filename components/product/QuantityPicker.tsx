"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { selectQuantity, useSelectedQuantity } from "@/lib/option-selection";
import { siteConfig } from "@/lib/site-config";

/** "Quantity: − 1 +" on the product page; Buy Now takes this many to checkout. */
export function QuantityPicker({ productSlug }: { productSlug: string }) {
  const quantity = useSelectedQuantity(productSlug);
  const max = siteConfig.store.maxQuantityPerItem;
  const buttonClasses =
    "flex size-10 items-center justify-center text-ink hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-ink-soft disabled:hover:bg-transparent";
  return (
    <div className="flex flex-col gap-2">
      <p id="quantity-label" className="text-sm font-semibold text-ink">
        Quantity:
      </p>
      <div
        role="group"
        aria-labelledby="quantity-label"
        className="flex w-fit items-center overflow-hidden rounded-lg border border-line"
      >
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          onClick={() => selectQuantity(productSlug, quantity - 1)}
          className={buttonClasses}
        >
          <MinusIcon className="size-4" />
        </button>
        <output aria-live="polite" className="w-12 text-center text-sm font-semibold text-ink">
          {quantity}
        </output>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={quantity >= max}
          onClick={() => selectQuantity(productSlug, quantity + 1)}
          className={buttonClasses}
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
