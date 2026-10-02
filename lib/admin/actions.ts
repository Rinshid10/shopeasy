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
import { REVIEWS_TAG } from "@/lib/reviews";
import {
  isMeeshoReviewImage,
  MAX_REVIEW_IMAGES,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/mappers";
import { routes } from "@/lib/routes";
import type { AdminOrderStatus, Coupon, MeeshoRatings, ReturnStatus, StoreSettings } from "@/types";

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
  /** Meesho rating and reviews to show on the product page, or null to show none. */
  meesho?: MeeshoRatings | null;
}

export async function saveProduct({
  slug,
  values,
  imagePaths,
  meesho,
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
    ...(meesho === undefined
      ? {}
      : {
          meesho_rating: meesho
            ? Math.min(5, Math.max(0, Math.round(meesho.rating * 10) / 10))
            : null,
          meesho_rating_count: meesho?.ratingCount ?? null,
          meesho_review_count: meesho?.reviewCount ?? null,
          meesho_star_counts:
            meesho?.starCounts?.length === 5
              ? meesho.starCounts.map((count) => Math.max(0, Math.round(count)))
              : null,
          meesho_url: meesho?.url ?? null,
          meesho_reviews: (meesho?.reviews ?? []).slice(0, 20).map((review) => ({
            rating: Math.min(5, Math.max(1, Math.round(review.rating))),
            ...(review.name ? { name: review.name.slice(0, 80) } : {}),
            comment: review.comment.slice(0, 1000),
            ...(review.images?.length
              ? { images: review.images.filter(isMeeshoReviewImage).slice(0, MAX_REVIEW_IMAGES) }
              : {}),
            date: review.date.slice(0, 10),
          })),
        }),
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

/** Hides a review from the shop, or shows it again. */
export async function setReviewHidden(reviewId: string, hidden: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("set_review_hidden", {
    p_review_id: reviewId,
    p_hidden: hidden,
  });
  if (error) return failure(error);
  updateTag(REVIEWS_TAG);
  updateTag(CATALOGUE_TAG);
  revalidatePath(routes.admin.reviews);
  return { ok: true, data: undefined };
}

/**
 * Deletes a product from the shop. Past orders keep their own copy of its name, price and
 * picture, so order history is unaffected; its cart entries and reviews go with it. Its
 * uploaded pictures are removed too, unless another product uses them.
 */
export async function deleteProduct(slug: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: product, error: readError } = await supabase
    .from("products")
    .select("id, image_path, extra_image_paths")
    .eq("slug", slug)
    .maybeSingle();
  if (readError) return failure(readError);
  if (!product) return { ok: false, error: "This product no longer exists." };

  const { error } = await supabase.from("products").delete().eq("id", product.id);
  if (error) return failure(error);

  // Uploaded pictures (not the demo ones in public/) that no other product uses.
  const pictures = [product.image_path, ...product.extra_image_paths].filter(
    (path): path is string =>
      typeof path === "string" && !path.startsWith("/") && !path.startsWith("http"),
  );
  if (pictures.length > 0) {
    const { data: others } = await supabase
      .from("products")
      .select("image_path, extra_image_paths");
    const inUse = new Set(
      (others ?? []).flatMap((other) => [other.image_path, ...other.extra_image_paths]),
    );
    const unused = pictures.filter((path) => !inUse.has(path));
    if (unused.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .remove(unused);
      if (storageError) console.error("[delete product] couldn't remove pictures", storageError);
    }
  }

  refreshStore();
  updateTag(REVIEWS_TAG);
  revalidatePath(routes.admin.products);
  revalidatePath(routes.admin.inventory);
  return { ok: true, data: undefined };
}
