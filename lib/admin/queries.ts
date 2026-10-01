import "server-only";

import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/session";
import { getImageUrl, toProduct } from "@/lib/supabase/mappers";
import type {
  Address,
  AdminOrder,
  AdminOrderStatus,
  CodPaymentStatus,
  Coupon,
  CouponType,
  Customer,
  ListingStatus,
  Payout,
  PayoutStatus,
  Product,
  ProductInventory,
  ReturnRequest,
  ReturnStatus,
  StoreSettings,
} from "@/types";
import type { Tables } from "@/types/supabase";

// The only module the admin screens read from. Every query runs as the signed-in admin, and
// the database's row level security only returns everything to admins.

/** A catalogue product together with the stock and listing details the store keeps. */
export interface AdminProduct extends Product {
  inventory: ProductInventory;
  /** The stored picture path (in the product-images bucket, or under public/), if any. */
  imagePath: string | null;
}

/** A customer together with totals from their orders. */
export interface CustomerSummary extends Customer {
  orderCount: number;
  totalSpent: number;
  /** ISO date-time of their latest order, if any. */
  lastOrderAt?: string;
}

/** The rows of a successful query; throws if the query failed. */
function unwrap<T>(result: PostgrestSingleResponse<T>): T {
  if (!result.success) throw new Error(`Admin query failed: ${result.error.message}`);
  return result.data;
}

type OrderRow = Tables<"orders"> & {
  order_items: Tables<"order_items">[];
  order_events: Tables<"order_events">[];
};

function toAdminOrder(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    placedAt: row.placed_at,
    status: row.status as AdminOrderStatus,
    customerId: row.user_id,
    address: row.address as unknown as Address,
    lines: [...row.order_items]
      .sort((a, b) => a.id - b.id)
      .map((item) => ({
        productSlug: item.product_slug,
        title: item.title,
        imageUrl: getImageUrl(item.image_path),
        price: item.price,
        quantity: item.quantity,
      })),
    deliveryCharge: row.delivery_charge,
    total: row.total,
    paymentMethod: "cod",
    paymentStatus: row.payment_status as CodPaymentStatus,
    timeline: [...row.order_events]
      .sort((a, b) => a.id - b.id)
      .map((event) => ({ status: event.status as AdminOrderStatus, at: event.created_at })),
  };
}

function toAdminProduct(row: Tables<"products">): AdminProduct {
  return {
    ...toProduct(row),
    imagePath: row.image_path,
    inventory: {
      productSlug: row.slug,
      sku: row.sku,
      stock: row.stock,
      lowStockThreshold: row.low_stock_threshold,
      listingStatus: row.status as ListingStatus,
    },
  };
}

/** The moment the dashboard measures from. */
export async function getReportingNow(): Promise<string> {
  return new Date().toISOString();
}

const ORDER_COLUMNS = "*, order_items(*), order_events(*)";

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const { supabase } = await requireAdmin();
  const rows = unwrap(
    await supabase.from("orders").select(ORDER_COLUMNS).order("placed_at", { ascending: false }),
  );
  return (rows as OrderRow[]).map(toAdminOrder);
}

export async function getAdminOrder(id: string): Promise<AdminOrder | undefined> {
  const { supabase } = await requireAdmin();
  const row = unwrap(
    await supabase.from("orders").select(ORDER_COLUMNS).eq("id", id).maybeSingle(),
  );
  return row ? toAdminOrder(row as OrderRow) : undefined;
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { supabase } = await requireAdmin();
  const rows = unwrap(await supabase.from("products").select("*").order("created_at"));
  return rows.map(toAdminProduct);
}

export async function getAdminProduct(slug: string): Promise<AdminProduct | undefined> {
  const { supabase } = await requireAdmin();
  const row = unwrap(await supabase.from("products").select("*").eq("slug", slug).maybeSingle());
  return row ? toAdminProduct(row) : undefined;
}

/** Customers are the shoppers who have ordered, described by their latest delivery address. */
export async function getCustomers(): Promise<CustomerSummary[]> {
  const orders = await getAdminOrders();
  const byCustomer = new Map<string, AdminOrder[]>();
  for (const order of orders) {
    byCustomer.set(order.customerId, [...(byCustomer.get(order.customerId) ?? []), order]);
  }

  return [...byCustomer.entries()]
    .map(([id, customerOrders]) => {
      // Orders are newest first.
      const latest = customerOrders[0];
      const counted = customerOrders.filter((order) => order.status !== "cancelled");
      return {
        id,
        name: latest.address.fullName,
        phone: latest.address.phone,
        city: latest.address.city,
        state: latest.address.state,
        joinedAt: customerOrders[customerOrders.length - 1].placedAt,
        orderCount: counted.length,
        totalSpent: counted.reduce((sum, order) => sum + order.total, 0),
        lastOrderAt: latest.placedAt,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  return (await getCustomers()).find((customer) => customer.id === id);
}

export async function getCoupons(): Promise<Coupon[]> {
  const { supabase } = await requireAdmin();
  const rows = unwrap(
    await supabase.from("coupons").select("*").order("created_at", { ascending: false }),
  );
  return rows.map((row) => ({
    code: row.code,
    description: row.description,
    type: row.type as CouponType,
    value: row.value,
    minOrderValue: row.min_order_value,
    usageCount: row.usage_count,
    usageLimit: row.usage_limit ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    isActive: row.is_active,
  }));
}

export async function getReturns(): Promise<ReturnRequest[]> {
  const { supabase } = await requireAdmin();
  const rows = unwrap(
    await supabase.from("return_requests").select("*").order("requested_at", { ascending: false }),
  );
  return rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    productSlug: row.product_slug,
    productTitle: row.product_title,
    customerId: row.user_id,
    reason: row.reason,
    requestedAt: row.requested_at,
    status: row.status as ReturnStatus,
    amount: row.amount,
  }));
}

export async function getPayouts(): Promise<Payout[]> {
  const { supabase } = await requireAdmin();
  const rows = unwrap(
    await supabase.from("payouts").select("*").order("period_start", { ascending: false }),
  );
  return rows.map((row) => ({
    id: row.id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    orderCount: row.order_count,
    amount: row.amount,
    status: row.status as PayoutStatus,
    paidAt: row.paid_at ?? undefined,
  }));
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const { supabase } = await requireAdmin();
  const row = unwrap(await supabase.from("store_settings").select("*").maybeSingle());
  if (!row) throw new Error("Store settings are missing from the database.");
  return {
    storeName: row.store_name,
    contactEmail: row.contact_email,
    supportPhone: row.support_phone,
    whatsappNumber: row.whatsapp_number,
    deliveryCharge: row.delivery_charge,
    freeDeliveryAbove: row.free_delivery_above,
    deliveryDaysMin: row.delivery_days_min,
    deliveryDaysMax: row.delivery_days_max,
    isCodEnabled: row.is_cod_enabled,
    codLimit: row.cod_limit,
    returnWindowDays: row.return_window_days,
  };
}
