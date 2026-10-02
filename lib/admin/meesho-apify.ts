import "server-only";

// Fetches a product from Meesho through Apify's "Meesho Product Detail Scraper"
// (https://apify.com/jobscrawler/meesho-product-detail-scraper). A scrape can take up to a
// minute, longer than a hosting platform lets one request run, so it's done in two short
// steps: start the run, then check on it until it has finished.

const APIFY_API = "https://api.apify.com/v2";
const DEFAULT_ACTOR = "jobscrawler~meesho-product-detail-scraper";
/** Give up on a run after this many seconds. */
const RUN_TIMEOUT_SECONDS = 180;

/** The fields we use from the scraper's result. */
export interface MeeshoScrape {
  title?: string;
  description?: string;
  price?: number;
  mrp?: number;
  /** "Label: value" lines, e.g. "Color: Blue". */
  fullDetails?: string;
  imageUrls?: string[];
  thumbnailUrl?: string;
  category?: string;
  supplierName?: string;
  averageRating?: number;
  ratingCount?: number;
  url?: string;
}

export class MeeshoImportError extends Error {}

function apifyToken(): string {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new MeeshoImportError(
      "Apify isn't set up yet: add APIFY_TOKEN to the site's environment settings.",
    );
  }
  return token;
}

async function apify<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${APIFY_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apifyToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (response.status === 401) {
    throw new MeeshoImportError("The Apify token was refused. Check APIFY_TOKEN.");
  }
  if (response.status === 402 || response.status === 403) {
    throw new MeeshoImportError(
      "Apify refused the request: the free credit may be used up. Check your Apify account.",
    );
  }
  if (!response.ok) {
    throw new MeeshoImportError(`Apify returned an error (${response.status}). Try again.`);
  }
  return (await response.json()) as T;
}

/** A Meesho product page link, e.g. https://www.meesho.com/some-name/p/8vwcy5. */
export function normaliseMeeshoUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    throw new MeeshoImportError("Paste a full Meesho product link, starting with https://");
  }
  const isMeesho = url.hostname === "meesho.com" || url.hostname.endsWith(".meesho.com");
  if (!isMeesho || !/\/p\/[\w-]+/.test(url.pathname)) {
    throw new MeeshoImportError(
      "That isn't a Meesho product link. Open the product on meesho.com and copy its link.",
    );
  }
  return `https://www.meesho.com${url.pathname}`;
}

/** Starts scraping one product; returns the Apify run id to check on. */
export async function startMeeshoScrape(productUrl: string): Promise<string> {
  const actor = process.env.APIFY_MEESHO_ACTOR || DEFAULT_ACTOR;
  const { data } = await apify<{ data: { id: string } }>(
    `/actors/${encodeURIComponent(actor)}/runs?timeout=${RUN_TIMEOUT_SECONDS}`,
    {
      method: "POST",
      body: JSON.stringify({
        productUrls: [productUrl],
        maxItems: 1,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
          apifyProxyCountry: "IN",
        },
      }),
    },
  );
  return data.id;
}

export type MeeshoScrapeStatus =
  | { status: "running" }
  | { status: "done"; product: MeeshoScrape }
  | { status: "failed"; error: string };

/** Checks a run; once it has finished, returns the scraped product. */
export async function checkMeeshoScrape(runId: string): Promise<MeeshoScrapeStatus> {
  if (!/^[\w-]+$/.test(runId)) return { status: "failed", error: "Unknown import." };

  const { data: run } = await apify<{ data: { status: string; defaultDatasetId: string } }>(
    `/actor-runs/${runId}`,
  );
  if (run.status === "READY" || run.status === "RUNNING") return { status: "running" };
  if (run.status === "TIMED-OUT") {
    return { status: "failed", error: "Meesho took too long to answer. Try again." };
  }
  if (run.status !== "SUCCEEDED") {
    return { status: "failed", error: "Couldn't read that product from Meesho. Try again." };
  }

  const items = await apify<MeeshoScrape[]>(
    `/datasets/${run.defaultDatasetId}/items?clean=true&limit=1`,
  );
  const product = items[0];
  if (!product?.title) {
    return {
      status: "failed",
      error: "Couldn't read that product. Check the link, or use the paste box instead.",
    };
  }
  return { status: "done", product };
}

/** Starts any Apify scraper with this input; returns the run id to check on. */
export async function startApifyRun(actor: string, input: unknown): Promise<string> {
  const { data } = await apify<{ data: { id: string } }>(
    `/actors/${encodeURIComponent(actor)}/runs?timeout=${RUN_TIMEOUT_SECONDS}`,
    { method: "POST", body: JSON.stringify(input) },
  );
  return data.id;
}

export type ApifyRunStatus<T> =
  { status: "running" } | { status: "done"; items: T[] } | { status: "failed"; error: string };

/** Checks any Apify run; once it has finished, returns up to `limit` result items. */
export async function checkApifyRun<T>(runId: string, limit = 50): Promise<ApifyRunStatus<T>> {
  if (!/^[\w-]+$/.test(runId)) return { status: "failed", error: "Unknown request." };
  const { data: run } = await apify<{ data: { status: string; defaultDatasetId: string } }>(
    `/actor-runs/${runId}`,
  );
  if (run.status === "READY" || run.status === "RUNNING") return { status: "running" };
  if (run.status !== "SUCCEEDED") {
    return { status: "failed", error: "Meesho didn't answer in time. Try again." };
  }
  const items = await apify<T[]>(
    `/datasets/${run.defaultDatasetId}/items?clean=true&limit=${limit}`,
  );
  return { status: "done", items };
}

/** Apify's page fetcher; reads the Meesho page itself for the rating bars. */
const PAGE_FETCH_ACTOR = "apify~web-fetch";

/** Starts fetching a Meesho product page as plain text; returns the run id to check on. */
export function startMeeshoPageFetch(productUrl: string): Promise<string> {
  return startApifyRun(PAGE_FETCH_ACTOR, { url: productUrl, formats: ["text"] });
}

/** The rating summary from a Meesho product page. */
export interface MeeshoRatingSummary {
  rating: number;
  ratingCount: number;
  reviewCount: number;
  /** Ratings per star level, best first: [5 stars, 4, 3, 2, 1]. */
  starCounts: number[];
}

const toCount = (text: string) => Number(text.replace(/,/g, ""));

/**
 * Reads the "Product Ratings & Reviews" box from a Meesho page's text, which runs together
 * like "Product Ratings & Reviews3.9101253 Ratings,40070 ReviewsPoor10259Average4493…".
 */
export function parseMeeshoRatingSummary(text: string): MeeshoRatingSummary | null {
  const start = text.indexOf("Product Ratings & Reviews");
  if (start === -1) return null;
  const box = text.slice(start, start + 400);
  const totals = box.match(
    /Reviews\s*(\d(?:\.\d)?)\s*([\d,]+)\s*Ratings?\s*,\s*([\d,]+)\s*Reviews?/,
  );
  if (!totals) return null;
  // "Very Good" before "Good", so the plain "Good" match skips it.
  const levels = [
    /Excellent\s*([\d,]+)/,
    /Very Good\s*([\d,]+)/,
    /(?<!Very )Good\s*([\d,]+)/,
    /Average\s*([\d,]+)/,
    /Poor\s*([\d,]+)/,
  ];
  const starCounts = levels.map((level) => box.match(level)?.[1]);
  if (starCounts.some((count) => count === undefined)) return null;

  const rating = Number(totals[1]);
  if (!(rating > 0 && rating <= 5)) return null;
  return {
    rating,
    ratingCount: toCount(totals[2]),
    reviewCount: toCount(totals[3]),
    starCounts: starCounts.map((count) => toCount(count!)),
  };
}

/** Checks a page fetch; once done, returns its rating summary, or null if it had none. */
export async function checkMeeshoPageFetch(
  runId: string,
): Promise<{ status: "running" } | { status: "done"; summary: MeeshoRatingSummary | null }> {
  const result = await checkApifyRun<{ text?: string }>(runId, 1);
  if (result.status === "running") return result;
  const text = result.status === "done" ? (result.items[0]?.text ?? "") : "";
  return { status: "done", summary: parseMeeshoRatingSummary(text) };
}
