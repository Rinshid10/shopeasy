"use client";

import { CartItemRow } from "@/components/checkout/CartItemRow";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckoutLoading, EmptyCart } from "@/components/checkout/CheckoutStatus";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { useCartView } from "@/lib/checkout/use-cart-view";
import { routes } from "@/lib/routes";
import type { Product } from "@/types";

interface CartViewProps {
  products: Product[];
}

/** Step 1: review the products in the cart and change quantities. */
export function CartView({ products }: CartViewProps) {
  const view = useCartView(products);

  if (!view) {
    return <CheckoutLoading />;
  }
  if (view.lines.length === 0) {
    return <EmptyCart />;
  }

  return (
    <CheckoutLayout
      step="cart"
      title="Cart"
      summary={view.summary}
      action={
        <ButtonLink href={routes.checkoutAddress} variant="buy" size="lg" fullWidth>
          Continue
        </ButtonLink>
      }
    >
      <Card className="p-4 sm:p-5">
        <ul className="divide-y divide-line">
          {view.lines.map((line) => (
            <CartItemRow key={line.product.slug} line={line} />
          ))}
        </ul>
      </Card>
    </CheckoutLayout>
  );
}
