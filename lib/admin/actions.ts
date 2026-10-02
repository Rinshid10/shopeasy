"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  MAX_PICTURES,
  MIN_PICTURES,
  parseSpecLines,
  validateProductForm,
  type ProductFormValues,
} from "@/lib/admin/product-form";
import { requireAdmin } from "@/lib/admin/session";
import { CATALOGUE_TAG } from "@/lib/catalogue-cache";
import { routes } from "@/lib/routes";
import type { AdminOrderStatus, Coupon, ReturnStatus, StoreSettings } from "@/types";

// Every admin change goes through these Server Actions. Each one checks the admin session
// itself (Server Actions are public endpoints), and RLS checks the admin role again.

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: { message: string; code?: string }): { ok: false; error: string } {
  if (error.code === "23505") return { ok: false, error: "That already exists." };
  return { ok: false, error: error.message };
}

/** Shop pages are built ahead of time; rebuild them after a catalogue or settings change. */
function refreshStore() {
  updateTag(CATALOGUE_TAG);
  revalidatePath("/", "layout");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function lines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

interface SaveProductInput {
  /** The product being edited; leave out to add a new one. */
  slug?: string;
  values: ProductFormValues;
  /**
   * Picture paths in the product-images bucket (or under public/), main picture first.
   * At least 1 and at most 4.
   */
  imagePaths: string[];
}

export async function saveProduct({
  slug,
  values,
  imagePaths,
}: SaveProductInput): Promise<ActionResult<{ slug: string }>> {
  const { supabase } = await requireAdmin();

  const errors = validateProductForm(values);
  const firstError = Object.values(errors)[0];
  if (firstError) return { ok: false, error: firstError };
  if (imagePaths.length < MIN_PICTURES) {
    return { ok: false, error: "Add at least one picture of the product." };
  }
  if (imagePaths.length > MAX_PICTURES) {
    return { ok: false, error: `Add at most ${MAX_PICTURES} pictures.` };
  }

  const row = {
    title: values.title.trim(),
    brand: values.brand.trim(),
    category_slug: values.categorySlug,
    short_description: values.shortDescription.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    mrp: values.mrp.trim() ? Number(values.mrp) : null,
    sku: values.sku.trim(),
    stock: Number(values.stock),
    low_stock_threshold: Number(values.lowStockThreshold),
    pros: lines(values.pros),
    cons: lines(values.cons),
    specs: parseSpecLines(values.specs),
    status: values.listingStatus,
    image_path: imagePaths[0],
    extra_image_paths: imagePaths.slice(1),
  };

  if (slug) {
    const { error } = await supabase.from("products").update(row).eq("slug", slug);
    if (error) return failure(error);
  } else {
    const newSlug = slugify(values.title);
    if (!newSlug) return { ok: false, error: "Enter a product name with letters or numbers." };
    const { error } = await supabase.from("products").insert({ ...row, slug: newSlug });
    if (error) {
      return error.code === "23505"
        ? { ok: false, error: "A product with this name or SKU already exists." }
        : failure(error);
    }
    slug = newSlug;
  }

  refreshStore();
  return { ok: true, data: { slug } };
}

export async function setProductStock(slug: string, stock: number): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, error: "Stock must be 0 or more." };
  }
  const { error } = await supabase.from("products").update({ stock }).eq("slug", slug);
  if (error) return failure(error);
  revalidatePath(routes.admin.inventory);
  return { ok: true, data: undefined };
}

export async function setOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("set_order_status", {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) return failure(error);
  revalidatePath(routes.admin.order(orderId));
  revalidatePath(routes.admin.orders);
  return { ok: true, data: undefined };
}

export async function createCoupon(coupon: Coupon): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("coupons").insert({
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    min_order_value: coupon.minOrderValue,
    usage_limit: coupon.usageLimit ?? null,
    expires_at: coupon.expiresAt ?? null,
    is_active: coupon.isActive,
  });
  if (error) return failure(error);
  revalidatePath(routes.admin.coupons);
  return { ok: true, data: undefined };
}

export async function setCouponActive(code: string, isActive: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("coupons").update({ is_active: isActive }).eq("code", code);
  if (error) return failure(error);
  revalidatePath(routes.admin.coupons);
  return { ok: true, data: undefined };
}

export async function setReturnStatus(id: string, status: ReturnStatus): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("return_requests").update({ status }).eq("id", id);
  if (error) return failure(error);
  revalidatePath(routes.admin.returns);
  return { ok: true, data: undefined };
}

export async function saveStoreSettings(settings: StoreSettings): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: settings.storeName.trim(),
      contact_email: settings.contactEmail.trim(),
      support_phone: settings.supportPhone.trim(),
      whatsapp_number: settings.whatsappNumber.trim(),
      delivery_charge: settings.deliveryCharge,
      free_delivery_above: settings.freeDeliveryAbove,
      delivery_days_min: settings.deliveryDaysMin,
      delivery_days_max: settings.deliveryDaysMax,
      is_cod_enabled: settings.isCodEnabled,
      cod_limit: settings.codLimit,
      return_window_days: settings.returnWindowDays,
    })
    .eq("id", true);
  if (error) return failure(error);
  revalidatePath(routes.admin.settings);
  refreshStore();
  return { ok: true, data: undefined };
}
