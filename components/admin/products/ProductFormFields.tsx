import { AdminCard } from "@/components/admin/AdminCard";
import { FormField, TextInput, fieldControlClasses } from "@/components/checkout/FormField";
import { getDiscountPercent } from "@/lib/format";
import type { ProductFormErrors, ProductFormValues } from "@/lib/admin/product-form";
import type { Category } from "@/types";

interface ProductFormFieldsProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  categories: Category[];
  onChange: <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => void;
}

const textareaClasses = (hasError: boolean) =>
  `${fieldControlClasses(hasError)} h-auto min-h-24 py-3 leading-relaxed`;

/** Keeps only digits, for price and stock fields. */
const digits = (value: string) => value.replace(/\D/g, "");

/** The product form's main column: details, pricing, stock and highlights. */
export function ProductFormFields({
  values,
  errors,
  categories,
  onChange,
}: ProductFormFieldsProps) {
  const discount = getDiscountPercent(Number(values.price), Number(values.mrp) || undefined);
  const text = (field: keyof ProductFormValues, label: string, extra: object = {}) => (
    <FormField id={`product-${field}`} label={label} error={errors[field]}>
      <TextInput
        id={`product-${field}`}
        value={values[field]}
        error={errors[field]}
        onChange={(event) => onChange(field, event.target.value)}
        {...extra}
      />
    </FormField>
  );
  const number = (field: keyof ProductFormValues, label: string, hint?: string) => (
    <FormField id={`product-${field}`} label={label} error={errors[field]} hint={hint}>
      <TextInput
        id={`product-${field}`}
        inputMode="numeric"
        value={values[field]}
        error={errors[field]}
        onChange={(event) => onChange(field, digits(event.target.value))}
      />
    </FormField>
  );

  return (
    <div className="flex flex-col gap-5">
      <AdminCard title="Details">
        {text("title", "Product name")}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("brand", "Brand (optional)")}
          <FormField id="product-categorySlug" label="Category" error={errors.categorySlug}>
            <select
              id="product-categorySlug"
              value={values.categorySlug}
              onChange={(event) => onChange("categorySlug", event.target.value)}
              aria-invalid={errors.categorySlug ? true : undefined}
              className={fieldControlClasses(Boolean(errors.categorySlug))}
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        {text("shortDescription", "One-line summary", { maxLength: 120 })}
        <FormField id="product-description" label="Full description">
          <textarea
            id="product-description"
            rows={4}
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
            className={textareaClasses(false)}
          />
        </FormField>
      </AdminCard>
      <AdminCard
        title="Product details"
        description='One per line, like "Color: Blue". Shown as a table on the product page.'
      >
        <FormField id="product-specs" label="Details (optional)">
          <textarea
            id="product-specs"
            rows={6}
            value={values.specs}
            placeholder={"Color: Blue\nMaterial: Vinyl\nCountry of Origin: India"}
            onChange={(event) => onChange("specs", event.target.value)}
            className={textareaClasses(false)}
          />
        </FormField>
      </AdminCard>
      <AdminCard title="Pricing">
        <div className="grid gap-4 sm:grid-cols-2">
          {number("price", "Selling price (₹)")}
          {number(
            "mrp",
            "MRP (₹, optional)",
            discount
              ? `Shows as ${discount}% OFF in the store.`
              : "Shown struck through when higher.",
          )}
        </div>
      </AdminCard>
      <AdminCard title="Inventory">
        <div className="grid gap-4 sm:grid-cols-3">
          {text("sku", "SKU")}
          {number("stock", "In stock")}
          {number("lowStockThreshold", "Low-stock alert at")}
        </div>
      </AdminCard>
      <AdminCard title="Highlights" description="One point per line. Shown as pros and cons.">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["pros", "cons"] as const).map((field) => (
            <FormField
              key={field}
              id={`product-${field}`}
              label={field === "pros" ? "What's good" : "Things to know"}
            >
              <textarea
                id={`product-${field}`}
                rows={4}
                value={values[field]}
                onChange={(event) => onChange(field, event.target.value)}
                className={textareaClasses(false)}
              />
            </FormField>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
