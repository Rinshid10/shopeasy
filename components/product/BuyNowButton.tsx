"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { ShoppingBagIcon } from "@/components/ui/icons";
import { buyNow, preloadCheckout } from "@/lib/checkout/store";
import { routes } from "@/lib/routes";
import {
  requestOptions,
  SELECT_OPTIONS_ID,
  useSelectedOptions,
  useSelectedQuantity,
} from "@/lib/option-selection";
import type { ProductOption } from "@/lib/product-options";

const NO_OPTIONS: readonly ProductOption[] = [];

interface BuyNowButtonProps {
  productSlug: string;
  productTitle: string;
  /** The options the shopper must pick before buying (Size, Color, …). */
  options?: readonly ProductOption[];
  /**
   * True on the product page, where options are picked. Elsewhere (product cards), a
   * product with options opens its page to pick them.
   */
  onProductPage?: boolean;
  size?: ButtonSize;
  /** Short "Buy" label with no icon, for product cards in a grid. */
  compact?: boolean;
}

/** Selects the product to buy and goes straight to checkout (the shop has no cart). */
export function BuyNowButton({
  productSlug,
  productTitle,
  options = NO_OPTIONS,
  onProductPage = false,
  size = "md",
  compact = false,
}: BuyNowButtonProps) {
  const router = useRouter();
  const { selected, missing } = useSelectedOptions(productSlug, options);
  const quantity = useSelectedQuantity(productSlug);

  // Get checkout ready in the background: load the visitor's saved details and the page.
  useEffect(() => {
    preloadCheckout();
    router.prefetch(routes.checkoutAddress);
  }, [router]);

  function startCheckout() {
    if (missing.length > 0) {
      if (onProductPage) requestOptions(productSlug);
      else router.push(`${routes.product(productSlug)}#${SELECT_OPTIONS_ID}`);
      return;
    }
    buyNow(productSlug, selected, onProductPage ? quantity : 1);
    router.push(routes.checkoutAddress);
  }

  return (
    <button
      type="button"
      onClick={startCheckout}
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
