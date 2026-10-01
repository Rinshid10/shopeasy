"use client";

import Link from "next/link";
import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { CartIcon } from "@/components/ui/icons";
import { addToCart } from "@/lib/checkout/store";
import { useCheckout } from "@/lib/checkout/use-checkout";
import { routes } from "@/lib/routes";

interface AddToCartButtonProps {
  productSlug: string;
  productTitle: string;
  size?: ButtonSize;
}

/** Adds the product to the cart; once it is there, the button becomes a link to the cart. */
export function AddToCartButton({ productSlug, productTitle, size = "md" }: AddToCartButtonProps) {
  const checkout = useCheckout();
  const isInCart = checkout?.cart.some((item) => item.productSlug === productSlug) ?? false;
  const classes = buttonClasses({ variant: "outline-brand", size, fullWidth: true });

  if (isInCart) {
    return (
      <Link href={routes.cart} className={classes}>
        <CartIcon className="size-5 shrink-0" />
        Go to Cart
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => addToCart(productSlug)} className={classes}>
      <CartIcon className="size-5 shrink-0" />
      <span>
        Add to Cart
        <span className="sr-only">: {productTitle}</span>
      </span>
    </button>
  );
}
