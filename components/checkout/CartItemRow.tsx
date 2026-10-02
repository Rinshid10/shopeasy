"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPrice } from "@/components/product/ProductPrice";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import type { CartLine } from "@/lib/checkout/pricing";
import { setCartQuantity } from "@/lib/checkout/store";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

interface CartItemRowProps {
  line: CartLine;
}

const stepperButtonClasses =
  " flex size-9 items-center justify-center text-ink hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-ink-soft disabled:hover:bg-transparent";

/** The product being bought, with a quantity stepper. */
export function CartItemRow({ line }: CartItemRowProps) {
  const { product, quantity } = line;
  const maxQuantity = siteConfig.store.maxQuantityPerItem;

  return (
    <li className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <Link href={routes.product(product.slug)} className="w-20 shrink-0 sm:w-24">
        <ProductImage product={product} sizes="96px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link
          href={routes.product(product.slug)}
          className="line-clamp-2 text-sm font-medium text-ink hover:text-brand"
        >
          {product.title}
        </Link>
        <ProductPrice price={product.price} mrp={product.mrp} />
        <div className="flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-lg border border-line">
            <button
              type="button"
              aria-label={`Decrease quantity of ${product.title}`}
              disabled={quantity <= 1}
              onClick={() => setCartQuantity(product.slug, quantity - 1)}
              className={stepperButtonClasses}
            >
              <MinusIcon className="size-4" />
            </button>
            <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold text-ink">
              <span className="sr-only">Quantity </span>
              {quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${product.title}`}
              disabled={quantity >= maxQuantity}
              onClick={() => setCartQuantity(product.slug, quantity + 1)}
              className={stepperButtonClasses}
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
