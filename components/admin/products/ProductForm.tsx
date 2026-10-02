"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { ProductFormFields } from "@/components/admin/products/ProductFormFields";
import { DeleteProductButton } from "@/components/admin/products/DeleteProductButton";
import { MeeshoPasteCard } from "@/components/admin/products/MeeshoPasteCard";
import {
  MeeshoReviewsCard,
  type MeeshoReviewsHandle,
} from "@/components/admin/products/MeeshoReviewsCard";
import { ProductImagesField } from "@/components/admin/products/ProductImagesField";
import { SaveStatus, type SaveState } from "@/components/admin/SaveStatus";
import { Button } from "@/components/ui/Button";
import { saveProduct } from "@/lib/admin/actions";
import {
  MAX_PICTURES,
  MIN_PICTURES,
  toFormValues,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/lib/admin/product-form";
import type { AdminProduct } from "@/lib/admin/queries";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { Category, ListingStatus, MeeshoRatings } from "@/types";

interface ProductFormProps {
  /** The product to edit; leave out to add a new one. */
  product?: AdminProduct;
  categories: Category[];
}

const PICTURES_ID = "product-pictures";

const LISTING_OPTIONS: { value: ListingStatus; label: string; text: string }[] = [
  { value: "active", label: "Active", text: "Shown in the store" },
  { value: "draft", label: "Draft", text: "Hidden until you publish it" },
];

/** Adds or edits a product: details, pricing, stock, highlights, pictures and visibility. */
export function ProductForm({ product, categories }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(() => toFormValues(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [imagePaths, setImagePaths] = useState<string[]>(product?.imagePaths ?? []);
  const reviews = useRef<MeeshoReviewsHandle>(null);
  // Meesho rating and reviews shown on the product page, labelled as from Meesho.
  const [meesho, setMeesho] = useState<MeeshoRatings | null>(product?.meesho ?? null);
  const needsPicture = hasSubmitted && imagePaths.length < MIN_PICTURES;
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

  /** Fills the form from pasted Meesho text, keeping a SKU that was already typed. */
  /**
   * Fills the form from Meesho, keeping a SKU that was already typed and adding imported
   * pictures after any already chosen (up to 4). Uses the latest state, because an import
   * finishes up to a minute after it starts.
   */
  function fillFromMeesho(
    filled: Partial<ProductFormValues>,
    importedPaths?: string[],
    meeshoRating?: Omit<MeeshoRatings, "reviews"> | null,
  ) {
    if (meeshoRating) {
      setMeesho((current) => ({ ...meeshoRating, reviews: current?.reviews ?? [] }));
    }
    setValues((current) => {
      const next = { ...current, ...filled, sku: current.sku || filled.sku || "" };
      if (hasSubmitted) {
        setErrors(validateProductForm(next));
      }
      return next;
    });
    if (importedPaths && importedPaths.length > 0) {
      setImagePaths((current) => [...current, ...importedPaths].slice(0, MAX_PICTURES));
    }
    // A link import (it brings pictures) also looks up the product's Meesho reviews.
    if (importedPaths !== undefined && filled.title) {
      reviews.current?.fetchFor(filled.title);
    }
    setSaveState({ status: "idle" });
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
    if (imagePaths.length < MIN_PICTURES) {
      document.getElementById(PICTURES_ID)?.scrollIntoView({ block: "center" });
      return;
    }
    setSaveState({ status: "saving" });
    startSaving(async () => {
      const result = await saveProduct({ slug: product?.slug, values, imagePaths, meesho });
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
      <div className="flex flex-col gap-5">
        <MeeshoPasteCard categories={categories} onFill={fillFromMeesho} />
        <ProductFormFields
          values={values}
          errors={errors}
          categories={categories}
          onChange={update}
        />
        <MeeshoReviewsCard
          ref={reviews}
          productTitle={values.title}
          attached={meesho}
          onAttach={(research) => {
            setMeesho((current) => {
              const rating = current?.rating ?? research.averageRating;
              if (rating === null) return current;
              return {
                ...current,
                rating,
                ratingCount: current?.ratingCount ?? research.ratingCount ?? undefined,
                url: current?.url ?? research.matchedUrl ?? undefined,
                reviews: research.reviews.slice(0, 20).map((review) => ({
                  rating: review.rating,
                  name: review.name,
                  comment: review.comment,
                  images: review.images,
                  date: review.date.slice(0, 10),
                })),
              };
            });
            setSaveState({ status: "idle" });
          }}
          onDetach={() => {
            setMeesho(null);
            setSaveState({ status: "idle" });
          }}
        />
      </div>
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
        <div id={PICTURES_ID}>
          <AdminCard title="Pictures">
            <ProductImagesField
              imagePaths={imagePaths}
              productTitle={values.title}
              error={needsPicture ? "Add at least one picture of the product." : undefined}
              onChange={(paths) => {
                setImagePaths(paths);
                setSaveState({ status: "idle" });
              }}
            />
          </AdminCard>
        </div>
        <Button type="submit" variant="buy" size="lg" fullWidth disabled={isSaving}>
          {product ? "Save changes" : "Add product"}
        </Button>
        <SaveStatus state={saveState} />
        {product && <DeleteProductButton slug={product.slug} title={product.title} />}
      </div>
    </form>
  );
}
