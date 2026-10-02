"use client";

import { useEffect, useState } from "react";
import { BuyNowButton } from "@/components/product/BuyNowButton";
import { cn } from "@/lib/cn";
import type { Product } from "@/types";

interface StickyBuyBarProps {
  product: Pick<Product, "slug" | "title">;
  /** The id of the page's main buy buttons. The bar shows only while they are off screen. */
  mainButtonId: string;
}

/** On phones, keeps Buy Now within thumb reach once the main buttons scroll away. */
export function StickyBuyBar({ product, mainButtonId }: StickyBuyBarProps) {
  const [isMainButtonOnScreen, setIsMainButtonOnScreen] = useState(true);

  useEffect(() => {
    const mainButton = document.getElementById(mainButtonId);
    if (!mainButton) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsMainButtonOnScreen(entry.isIntersecting);
    });
    observer.observe(mainButton);
    return () => observer.disconnect();
  }, [mainButtonId]);

  return (
    <div
      className={cn(
        "bottom-action-bar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-10px_24px_-14px_rgb(15_23_42/0.3)] md:hidden",
        isMainButtonOnScreen ? "invisible translate-y-full" : "visible translate-y-0",
      )}
    >
      <BuyNowButton productSlug={product.slug} productTitle={product.title} />
    </div>
  );
}
