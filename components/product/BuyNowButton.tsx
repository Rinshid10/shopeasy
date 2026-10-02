"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { ShoppingBagIcon } from "@/components/ui/icons";
import { buyNow, preloadCheckout } from "@/lib/checkout/store";
import { routes } from "@/lib/routes";

interface BuyNowButtonProps {
  productSlug: string;
  productTitle: string;
  size?: ButtonSize;
  /** Short "Buy" label with no icon, for product cards in a grid. */
  compact?: boolean;
}

/** Selects the product to buy and goes straight to checkout (the shop has no cart). */
export function BuyNowButton({
  productSlug,
  productTitle,
  size = "md",
  compact = false,
}: BuyNowButtonProps) {
  const router = useRouter();

  // Get checkout ready in the background: load the visitor's saved details and the page.
  useEffect(() => {
    preloadCheckout();
    router.prefetch(routes.checkoutAddress);
  }, [router]);

  function startCheckout() {
    buyNow(productSlug);
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
