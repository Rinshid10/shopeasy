"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { ProductFormFields } from "@/components/admin/products/ProductFormFields";
import { ProductImageField } from "@/components/admin/products/ProductImageField";
import { SaveStatus, type SaveState } from "@/components/admin/SaveStatus";
import { Button } from "@/components/ui/Button";
import { saveProduct } from "@/lib/admin/actions";
import {
  toFormValues,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/lib/admin/product-form";
import type { AdminProduct } from "@/lib/admin/queries";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { Category, ListingStatus } from "@/types";

interface ProductFormProps {
  /** The product to edit; leave out to add a new one. */
  product?: AdminProduct;
  categories: Category[];
}

const LISTING_OPTIONS: { value: ListingStatus; label: string; text: string }[] = [
  { value: "active", label: "Active", text: "Shown in the store" },
  { value: "draft", label: "Draft", text: "Hidden until you publish it" },
];

/** Adds or edits a product: details, pricing, stock, highlights, picture and visibility. */
export function ProductForm({ product, categories }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(() => toFormValues(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(product?.imagePath ?? null);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isSaving, startSaving] = useTransition();
  const router = useRouter();

  function update<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    setSaveState({ status: "idle" });
    if (hasSubmitted) {
      setErrors(validateProductForm(next));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    const nextErrors = validateProductForm(values);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      document.getElementById(`product-${firstInvalid}`)?.focus();
      return;
    }
    setSaveState({ status: "saving" });
    startSaving(async () => {
      const result = await saveProduct({ slug: product?.slug, values, imagePath });
      if (!result.ok) {
        setSaveState({ status: "error", error: result.error });
        return;
      }
      setSaveState({ status: "saved", text: product ? "Changes saved." : "Product added." });
      if (!product) {
        router.replace(routes.admin.product(result.data.slug));
      }
    });
  }

  return (
    <form noValidate onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
      <ProductFormFields
        values={values}
        errors={errors}
        categories={categories}
        onChange={update}
      />
      <div className="flex flex-col gap-5 lg:sticky lg:top-24">
        <AdminCard title="Visibility">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Listing status</legend>
            {LISTING_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
                  values.listingStatus === option.value
                    ? "border-brand bg-brand-soft"
                    : "border-line",
                )}
              >
                <input
                  type="radio"
                  name="listingStatus"
                  value={option.value}
                  checked={values.listingStatus === option.value}
                  onChange={() => update("listingStatus", option.value)}
                  className="mt-1 accent-brand"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-ink">{option.label}</span>
                  <span className="text-xs text-ink-muted">{option.text}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </AdminCard>
        <AdminCard title="Picture">
          <ProductImageField
            imagePath={imagePath}
            productTitle={values.title}
            onChange={(path) => {
              setImagePath(path);
              setSaveState({ status: "idle" });
            }}
          />
        </AdminCard>
        <Button type="submit" variant="buy" size="lg" fullWidth disabled={isSaving}>
          {product ? "Save changes" : "Add product"}
        </Button>
        <SaveStatus state={saveState} />
      </div>
    </form>
  );
}
