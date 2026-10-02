"use server";

import type { ActionResult } from "@/lib/admin/actions";
import {
  checkMeeshoPageFetch,
  checkMeeshoScrape,
  MeeshoImportError,
  normaliseMeeshoUrl,
  startMeeshoPageFetch,
  startMeeshoScrape,
  type MeeshoScrape,
} from "@/lib/admin/meesho-apify";
import { parseMeeshoText } from "@/lib/admin/meesho-import";
import { MAX_PICTURES, type ProductFormValues } from "@/lib/admin/product-form";
import { requireAdmin } from "@/lib/admin/session";
import { getCategories } from "@/lib/categories";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/mappers";
import type { MeeshoRatings } from "@/types";

// Import a product from a Meesho link: start the scrape, then check on it every few seconds
// from the browser. Admin only, since each import uses Apify credit.

const PICTURE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_PICTURE_BYTES = 5 * 1024 * 1024;

function toFailure(error: unknown): { ok: false; error: string } {
  if (error instanceof MeeshoImportError) return { ok: false, error: error.message };
  console.error("[meesho import]", error);
  return { ok: false, error: "Something went wrong while importing. Try again." };
}

/** Starts importing a product from its Meesho link; returns an id to check on. */
export async function startMeeshoImport(
  link: string,
): Promise<ActionResult<{ runId: string; pageRunId: string | null }>> {
  await requireAdmin();
  try {
    const url = normaliseMeeshoUrl(link);
    const runId = await startMeeshoScrape(url);
    // The page itself has the rating bars; the import still works without them.
    const pageRunId = await startMeeshoPageFetch(url).catch((error: unknown) => {
      console.error("[meesho import] couldn't start the page fetch", error);
      return null;
    });
    return { ok: true, data: { runId, pageRunId } };
  } catch (error) {
    return toFailure(error);
  }
}

export type MeeshoImportCheck =
  | { status: "running" }
  | {
      status: "done";
      values: Partial<ProductFormValues>;
      /** Pictures copied into the product-images bucket, main one first. */
      imagePaths: string[];
      /** What was filled, for the confirmation message. */
      filled: string[];
      /** The product's own rating on Meesho, to show labelled on the product page. */
      meesho: Omit<MeeshoRatings, "reviews"> | null;
    };

/** Checks an import; once Meesho has answered, fills form values and copies the pictures. */
export async function checkMeeshoImport(
  runId: string,
  pageRunId: string | null,
): Promise<ActionResult<MeeshoImportCheck>> {
  const { supabase } = await requireAdmin();
  try {
    const result = await checkMeeshoScrape(runId);
    if (result.status === "running") return { ok: true, data: { status: "running" } };
    if (result.status === "failed") return { ok: false, error: result.error };
    const page = pageRunId
      ? await checkMeeshoPageFetch(pageRunId).catch(() => ({
          status: "done" as const,
          summary: null,
        }))
      : { status: "done" as const, summary: null };
    if (page.status === "running") return { ok: true, data: { status: "running" } };

    const { product } = result;
    const { values, filled } = parseMeeshoText(
      toMeeshoText(product),
      await getCategories(),
      product.category ?? "",
    );
    if (product.price) values.price = String(Math.round(product.price));
    if (product.mrp && product.price && product.mrp > product.price) {
      values.mrp = String(Math.round(product.mrp));
    }
    for (const [field, name] of [
      ["price", "price"],
      ["mrp", "MRP"],
    ] as const) {
      if (values[field] && !filled.includes(name)) filled.push(name);
    }

    const imagePaths = await copyPictures(product, supabase);
    if (imagePaths.length > 0) {
      filled.push(`${imagePaths.length} ${imagePaths.length === 1 ? "picture" : "pictures"}`);
    }
    // The page's own rating box is the most complete; the scraper's numbers are the fallback.
    const meesho = page.summary
      ? { ...page.summary, url: product.url }
      : typeof product.averageRating === "number" && product.averageRating > 0
        ? { rating: product.averageRating, ratingCount: product.ratingCount, url: product.url }
        : null;
    if (meesho) filled.push("Meesho rating");
    return { ok: true, data: { status: "done", values, imagePaths, filled, meesho } };
  } catch (error) {
    return toFailure(error);
  }
}

/** Rebuilds the scraped product as the text Meesho's page copies to, for parseMeeshoText. */
function toMeeshoText(product: MeeshoScrape): string {
  const title = product.title?.trim() ?? "";
  return [title, `Name: ${title}`, product.fullDetails ?? ""].join("\n");
}

/** Downloads up to 4 product pictures and stores them in the shop's own picture storage. */
async function copyPictures(
  product: MeeshoScrape,
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
): Promise<string[]> {
  // Catalog covers are collages of several products, not photos of this one.
  const urls = [...new Set([...(product.imageUrls ?? []), product.thumbnailUrl ?? ""])]
    .filter((url) => url.startsWith("https://") && !url.includes("/catalogs/"))
    .slice(0, MAX_PICTURES);

  const paths: string[] = [];
  for (const url of urls) {
    try {
      const response = await fetchLargestPicture(url);
      const type = response.headers.get("content-type")?.split(";")[0].trim() ?? "";
      const extension = PICTURE_TYPES[type];
      if (!response.ok || !extension) continue;
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength === 0 || bytes.byteLength > MAX_PICTURE_BYTES) continue;

      const path = `products/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, bytes, { contentType: type, cacheControl: "31536000" });
      if (!error) paths.push(path);
    } catch (error) {
      console.error("[meesho import] couldn't copy a picture", url, error);
    }
  }
  return paths;
}

/**
 * Meesho picture links end in a size, like "_512.jpg"; a 1200-pixel version usually exists
 * too. Fetch that, or the original link if it doesn't.
 */
async function fetchLargestPicture(url: string): Promise<Response> {
  const headers = { "User-Agent": "Mozilla/5.0" };
  const large = url.replace(/_\d+(\.\w+)$/, "_1200$1");
  if (large !== url) {
    const response = await fetch(large, { headers });
    if (response.ok) return response;
  }
  return fetch(url, { headers });
}
