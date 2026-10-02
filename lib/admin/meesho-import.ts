import type { ProductFormValues } from "@/lib/admin/product-form";
import type { Category, ProductSpec } from "@/types";

// Reads product text copied from a Meesho product page and turns it into product form values,
// so the admin can paste instead of typing. Meesho's copy looks like:
//
//   SUNRISES WALLPAPER Self Adhesive Wallpaper ... (Pack of 3)
//   Name: SUNRISES WALLPAPER Self Adhesive Wallpaper ...
//   Color: Blue
//   Material: Vinyl
//   Sizes:
//   Free size
//   Country of Origin: India
//
// Prices (e.g. "₹199", "₹499") are picked up when they are included.

/** Labels that are used for form fields rather than shown in the details table. */
const NAME_LABELS = new Set(["name", "product name", "title"]);
const BRAND_LABELS = new Set(["brand", "brand name", "manufacturer", "manufacturer name"]);
const DESCRIPTION_LABELS = new Set(["description", "product description", "product details"]);
/** Seller and shipping lines, which aren't details of the product itself. */
const SKIPPED_LABELS = new Set(["dispatch", "shipping", "delivery", "sold by", "supplier"]);

/** Words that point to each category, matched against the product name. */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "home-living": [
    "wallpaper",
    "wall sticker",
    "sticker",
    "kitchen",
    "curtain",
    "bedsheet",
    "bed sheet",
    "pillow",
    "cushion",
    "decor",
    "home",
    "organizer",
    "organiser",
    "cookware",
    "bottle",
    "lamp",
    "light",
    "towel",
    "mat",
    "doormat",
    "rug",
    "storage",
    "container",
  ],
  fashion: [
    "saree",
    "sari",
    "kurti",
    "kurta",
    "shirt",
    "t-shirt",
    "tshirt",
    "dress",
    "jeans",
    "top",
    "lehenga",
    "dupatta",
    "legging",
    "trouser",
    "pant",
    "jacket",
    "handbag",
    "bag",
    "wallet",
    "jewellery",
    "jewelry",
    "earring",
    "necklace",
    "bangle",
    "footwear",
    "sandal",
    "slipper",
    "sneaker",
    "shoe",
    "nightwear",
    "innerwear",
    "socks",
    "cap",
  ],
  "beauty-personal-care": [
    "serum",
    "cream",
    "lipstick",
    "makeup",
    "make-up",
    "shampoo",
    "hair",
    "face wash",
    "skin",
    "perfume",
    "nail",
    "kajal",
    "lotion",
    "soap",
    "trimmer",
    "beard",
  ],
  "electronics-appliances": [
    "earbuds",
    "earphone",
    "headphone",
    "speaker",
    "charger",
    "cable",
    "smart watch",
    "smartwatch",
    "bluetooth",
    "power bank",
    "mixer",
    "iron",
    "fan",
    "led",
  ],
  "mobiles-tablets": [
    "mobile",
    "phone",
    "back cover",
    "phone case",
    "tablet",
    "screen guard",
    "tempered glass",
  ],
  "toys-games": ["toy", "game", "puzzle", "doll", "kids", "baby", "teddy", "board game"],
  "sports-outdoors": [
    "yoga",
    "gym",
    "fitness",
    "sports",
    "cricket",
    "football",
    "badminton",
    "cycle",
    "running",
    "dumbbell",
    "skipping",
  ],
  furniture: ["chair", "table", "shelf", "rack", "sofa", "stool", "wardrobe", "bed frame"],
};

export interface MeeshoImport {
  /** Form fields worked out from the text; fields it couldn't find are left out. */
  values: Partial<ProductFormValues>;
  /** Human-readable names of the fields that were filled, for a confirmation message. */
  filled: string[];
}

/** A "Label: value" line. Labels are short and don't look like sentences or links. */
function splitLabel(line: string): { label: string; value: string } | null {
  const colon = line.indexOf(":");
  if (colon <= 0 || colon > 40) return null;
  const label = line.slice(0, colon).trim();
  if (/https?$/i.test(label) || label.split(/\s+/).length > 6) return null;
  // A colon inside brackets is part of a value, as in "Free Size (Saree Length: 5.5 m)".
  const opened = label.split("(").length - label.split(")").length;
  if (opened !== 0) return null;
  return { label, value: line.slice(colon + 1).trim() };
}

function parseRupees(text: string): number[] {
  return [...text.matchAll(/₹\s?([\d,]+(?:\.\d+)?)/g)]
    .map((match) => Math.round(Number(match[1].replace(/,/g, ""))))
    .filter((amount) => amount > 0);
}

/** The brand Meesho sellers often put first in capitals, e.g. "SUNRISES WALLPAPER ...". */
function brandFromTitle(title: string): string {
  const words = title.split(/\s+/);
  const capitals: string[] = [];
  for (const word of words) {
    const letters = word.replace(/[^A-Za-z]/g, "");
    if (letters.length >= 2 && letters === letters.toUpperCase()) {
      capitals.push(word);
      if (capitals.length === 3) break;
    } else {
      break;
    }
  }
  // A whole title in capitals isn't a brand.
  return capitals.length > 0 && capitals.length < words.length ? capitals.join(" ") : "";
}

function guessCategory(text: string, categories: Category[]): string {
  const haystack = ` ${text.toLowerCase()} `;
  const available = new Set(categories.map((category) => category.slug));
  let best = { slug: "", score: 0 };
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (!available.has(slug)) continue;
    const score = keywords.filter((keyword) => haystack.includes(keyword)).length;
    if (score > best.score) best = { slug, score };
  }
  return best.slug;
}

/** "Pack of 3" from "(Pack of 3)" in the name, or the Net Quantity detail. */
function packSize(title: string, specs: ProductSpec[]): string {
  const fromTitle = title.match(/pack of\s*(\d+)/i)?.[1];
  const fromSpecs = specs.find((spec) => /net quantity/i.test(spec.label))?.value;
  const count = fromTitle ?? fromSpecs?.match(/\d+/)?.[0];
  return count && Number(count) > 1 ? `Pack of ${count}` : "";
}

function shortSummary(title: string, specs: ProductSpec[]): string {
  const pick = (pattern: RegExp) => specs.find((spec) => pattern.test(spec.label))?.value ?? "";
  const parts = [
    pick(/^colou?r$/i),
    pick(/^material|fabric$/i),
    pick(/^(type|pattern|theme)$/i),
    packSize(title, specs),
  ].filter((part, index, all) => part && all.indexOf(part) === index);
  const summary = parts.join(" · ");
  if (summary.length >= 10) return summary.slice(0, 120);
  return title.length > 120 ? `${title.slice(0, 117).trimEnd()}…` : title;
}

function makeSku(categorySlug: string): string {
  const prefix = categorySlug ? categorySlug.slice(0, 3).toUpperCase() : "GEN";
  return `SE-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Turns copied Meesho product text into product form values. */
/**
 * `categoryHint` is extra text for guessing the category, such as Meesho's own category name
 * ("Sarees"); it isn't shown anywhere.
 */
export function parseMeeshoText(
  text: string,
  categories: Category[],
  categoryHint = "",
): MeeshoImport {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  let title = "";
  let brand = "";
  let description = "";
  const specs: ProductSpec[] = [];
  const looseLines: string[] = [];
  const prices = parseRupees(text);

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (/^₹/.test(line) || /^\d+%\s*off$/i.test(line)) continue;

    const pair = splitLabel(line);
    if (!pair) {
      looseLines.push(line);
      continue;
    }

    // "Sizes:" with the value on the following lines, until the next "Label:" line.
    let value = pair.value;
    if (!value) {
      const following: string[] = [];
      while (index + 1 < lines.length && !splitLabel(lines[index + 1])) {
        following.push(lines[++index]);
      }
      value = following.join(", ");
    }
    if (!value) continue;

    const key = pair.label.toLowerCase();
    if (NAME_LABELS.has(key)) title = value;
    else if (BRAND_LABELS.has(key)) brand = value;
    else if (DESCRIPTION_LABELS.has(key)) description = value;
    else if (SKIPPED_LABELS.has(key)) continue;
    else specs.push({ label: pair.label, value });
  }

  title ||= looseLines[0] ?? "";
  brand ||= brandFromTitle(title);
  const categorySlug = guessCategory(
    `${categoryHint} ${title} ${specs.map((spec) => spec.value).join(" ")}`,
    categories,
  );

  const values: Partial<ProductFormValues> = {};
  const filled: string[] = [];
  const set = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
    name: string,
  ) => {
    if (!value) return;
    values[field] = value;
    filled.push(name);
  };

  set("title", title, "name");
  set("brand", brand, "brand");
  set("categorySlug", categorySlug, "category");
  if (title) set("shortDescription", shortSummary(title, specs), "summary");
  set("description", description || title, "description");
  set(
    "specs",
    specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n"),
    `${specs.length} details`,
  );
  if (prices.length > 0) {
    const price = Math.min(...prices);
    const mrp = Math.max(...prices);
    set("price", String(price), "price");
    if (mrp > price) set("mrp", String(mrp), "MRP");
  }
  set("sku", makeSku(categorySlug), "SKU");

  return { values, filled };
}
