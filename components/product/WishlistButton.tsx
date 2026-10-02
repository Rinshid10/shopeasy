"use client";

import { HeartIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { toggleWishlist, useWishlist } from "@/lib/wishlist";

interface WishlistButtonProps {
  productSlug: string;
  productTitle: string;
  className?: string;
}

/** A round heart that adds the product to the wishlist, or takes it off. */
export function WishlistButton({ productSlug, productTitle, className }: WishlistButtonProps) {
  const isHearted = useWishlist().slugs.includes(productSlug);
  return (
    <button
      type="button"
      aria-pressed={isHearted}
      aria-label={
        isHearted ? `Remove ${productTitle} from wishlist` : `Add ${productTitle} to wishlist`
      }
      onClick={(event) => {
        // Cards are links; the heart shouldn't open the product.
        event.preventDefault();
        event.stopPropagation();
        void toggleWishlist(productSlug);
      }}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-surface shadow-sm",
        isHearted ? "text-brand" : "text-ink-muted hover:text-brand",
        className,
      )}
    >
      <HeartIcon className="size-5" filled={isHearted} />
    </button>
  );
}
