"use client";

import Link from "next/link";
import { CartIcon } from "@/components/ui/icons";
import { useCheckout } from "@/lib/checkout/use-checkout";
import { routes } from "@/lib/routes";

/** The cart icon in the header, with a badge showing how many items are in the cart. */
export function CartLink() {
  const checkout = useCheckout();
  const itemCount = checkout?.cart.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const label = itemCount > 0 ? `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}` : "Cart";

  return (
    <Link
      href={routes.cart}
      aria-label={label}
      className="relative flex size-10 pressable items-center justify-center rounded-lg text-ink hover:bg-surface-muted md:size-11"
    >
      <CartIcon className="size-6" />
      {itemCount > 0 && (
        <span
          key={itemCount}
          className="absolute top-0.5 right-0.5 flex h-5 min-w-5 enter-up items-center justify-center rounded-full bg-brand px-1 text-[11px] leading-none font-bold text-surface ring-2 ring-surface"
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}
