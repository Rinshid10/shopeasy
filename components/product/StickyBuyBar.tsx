"use client";

import { useEffect, useState } from "react";
import { AffiliateButton } from "@/components/product/AffiliateButton";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types";

interface StickyBuyBarProps {
  product: Pick<Product, "title" | "price" | "affiliateUrl">;
  /** The id of the page's main buy button. The bar shows only while that button is off screen. */
  mainButtonId: string;
}

/** On phones, keeps the price and buy button within thumb reach once the main button scrolls away. */
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
        "sticky-buy-bar fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-surface/95 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-10px_24px_-14px_rgb(15_23_42/0.3)] backdrop-blur transition-[translate,visibility] duration-300 ease-out md:hidden",
        isMainButtonOnScreen ? "invisible translate-y-full" : "visible translate-y-0",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-ink-muted">{product.title}</p>
        <p className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-ink">
            {formatPrice(product.price)}
          </span>
          <span className="text-[11px] text-ink-muted">{siteConfig.affiliate.linkLabel}</span>
        </p>
      </div>
      <div className="w-40 shrink-0">
        <AffiliateButton
          href={product.affiliateUrl}
          productTitle={product.title}
          size="md"
          compact
        />
      </div>
    </div>
  );
}
