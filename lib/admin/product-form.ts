import type { AdminProduct } from "@/lib/admin/queries";
import type { ListingStatus } from "@/types";

/** The product form's fields, kept as typed text until saved. */
export interface ProductFormValues {
  title: string;
  brand: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  price: string;
  mrp: string;
  sku: string;
  stock: string;
  lowStockThreshold: string;
  pros: string;
  cons: string;
  listingStatus: ListingStatus;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export function toFormValues(product: AdminProduct | undefined): ProductFormValues {
  return {
    title: product?.title ?? "",
    brand: product?.brand ?? "",
    categorySlug: product?.categorySlug ?? "",
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    mrp: product?.mrp ? String(product.mrp) : "",
    sku: product?.inventory.sku ?? "",
    stock: product ? String(product.inventory.stock) : "",
    lowStockThreshold: product ? String(product.inventory.lowStockThreshold) : "5",
    pros: product?.pros.join("\n") ?? "",
    cons: product?.cons.join("\n") ?? "",
    listingStatus: product?.inventory.listingStatus ?? "draft",
  };
}

function isWholeNumber(value: string, { allowZero }: { allowZero: boolean }): boolean {
  const number = Number(value);
  return value.trim() !== "" && Number.isInteger(number) && (allowZero ? number >= 0 : number > 0);
}

export function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (values.title.trim().length < 3) {
    errors.title = "Enter a product name of at least 3 characters.";
  }
  if (!values.categorySlug) {
    errors.categorySlug = "Choose a category.";
  }
  if (values.shortDescription.trim().length < 10) {
    errors.shortDescription = "Write a one-line summary of at least 10 characters.";
  }
  if (!isWholeNumber(values.price, { allowZero: false })) {
    errors.price = "Enter the selling price in whole rupees.";
  }
  if (values.mrp.trim() !== "") {
    if (!isWholeNumber(values.mrp, { allowZero: false })) {
      errors.mrp = "Enter the MRP in whole rupees, or leave it empty.";
    } else if (Number(values.mrp) < Number(values.price)) {
      errors.mrp = "MRP can't be lower than the selling price.";
    }
  }
  if (!values.sku.trim()) {
    errors.sku = "Enter a SKU so you can find this product in stock lists.";
  }
  if (!isWholeNumber(values.stock, { allowZero: true })) {
    errors.stock = "Enter how many are in stock (0 or more).";
  }
  if (!isWholeNumber(values.lowStockThreshold, { allowZero: true })) {
    errors.lowStockThreshold = "Enter a number, 0 or more.";
  }

  return errors;
}
