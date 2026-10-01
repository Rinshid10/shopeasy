"use client";

import { useRouter } from "next/navigation";
import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { ShoppingBagIcon } from "@/components/ui/icons";
import { ensureInCart } from "@/lib/checkout/store";
import { routes } from "@/lib/routes";

interface BuyNowButtonProps {
  productSlug: string;
  productTitle: string;
  size?: ButtonSize;
  /** Short "Buy" label with no icon, for product cards in a grid. */
  compact?: boolean;
}

/** Puts the product in the cart and goes straight to the delivery address step. */
export function BuyNowButton({
  productSlug,
  productTitle,
  size = "md",
  compact = false,
}: BuyNowButtonProps) {
  const router = useRouter();

  function buyNow() {
    ensureInCart(productSlug);
    router.push(routes.checkoutAddress);
  }

  return (
    <button
      type="button"
      onClick={buyNow}
      className={buttonClasses({ variant: "buy", size, fullWidth: true })}
    >
      {!compact && <ShoppingBagIcon className="size-5 shrink-0" />}
      <span>
        {compact ? "Buy" : "Buy Now"}
        <span className="sr-only">: {productTitle}</span>
      </span>
    </button>
  );
}
