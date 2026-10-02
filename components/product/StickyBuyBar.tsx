"use client";

import { BuyNowButton } from "@/components/product/BuyNowButton";
import type { ProductOption } from "@/lib/product-options";
import type { Product } from "@/types";

interface StickyBuyBarProps {
  product: Pick<Product, "slug" | "title">;
  /** The options the shopper picks (Size, Color, …); Buy Now asks for them first. */
  options: readonly ProductOption[];
}

/** On phones, Buy Now stays fixed at the bottom of the product page, as in a shopping app. */
export function StickyBuyBar({ product, options }: StickyBuyBarProps) {
  return (
    <div className="bottom-action-bar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-10px_24px_-14px_rgb(15_23_42/0.3)] md:hidden">
      <BuyNowButton
        productSlug={product.slug}
        productTitle={product.title}
        options={options}
        onProductPage
      />
    </div>
  );
}
