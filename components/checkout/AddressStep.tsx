"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddressCard } from "@/components/checkout/AddressCard";
import { AddressForm } from "@/components/checkout/AddressForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckoutLoading, EmptyCart } from "@/components/checkout/CheckoutStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PencilIcon } from "@/components/ui/icons";
import { saveAddress } from "@/lib/checkout/store";
import { useCartView } from "@/lib/checkout/use-cart-view";
import { routes } from "@/lib/routes";
import type { Address, Product } from "@/types";

interface AddressStepProps {
  products: Product[];
}

/** Step 2: enter a delivery address, or confirm the one saved from a previous order. */
export function AddressStep({ products }: AddressStepProps) {
  const router = useRouter();
  const view = useCartView(products);
  const [isEditing, setIsEditing] = useState(false);

  if (!view) {
    return <CheckoutLoading />;
  }
  if (view.lines.length === 0) {
    return <EmptyCart />;
  }

  const savedAddress = view.checkout.address;
  const showForm = isEditing || !savedAddress;

  function saveAndContinue(address: Address) {
    saveAddress(address);
    router.push(routes.checkoutPayment);
  }

  return (
    <CheckoutLayout
      step="address"
      title={showForm ? "Add Delivery Address" : "Select Delivery Address"}
      summary={view.summary}
      action={
        showForm ? (
          <Button type="submit" form="address-form" variant="buy" size="lg" fullWidth>
            Save Address and Continue
          </Button>
        ) : (
          <Button
            variant="buy"
            size="lg"
            fullWidth
            onClick={() => router.push(routes.checkoutPayment)}
          >
            Deliver to this Address
          </Button>
        )
      }
    >
      <Card className="p-4 sm:p-5">
        {showForm ? (
          <AddressForm
            initialAddress={savedAddress}
            onSave={saveAndContinue}
            onCancel={savedAddress ? () => setIsEditing(false) : undefined}
          />
        ) : (
          <AddressCard
            address={savedAddress}
            action={
              <Button variant="outline-brand" size="sm" onClick={() => setIsEditing(true)}>
                <PencilIcon className="size-4" />
                Edit
              </Button>
            }
          />
        )}
      </Card>
    </CheckoutLayout>
  );
}
