import type { Product, ProductSpec } from "@/types";

// The options a shopper picks before buying, taken from the product's details. A details row
// of one of these types that lists several values ("Color: Black, White") becomes a choice;
// the size types are a choice even with one value ("Size: Free Size"). The database's
// private.product_options applies the same rules to check orders, so keep the two in step.

const OPTION_TYPES = [
  { name: "Size", label: /^(sizes?|clothing sizes?)$/, minValues: 1 },
  { name: "Shoe Size", label: /^(shoe|footwear) sizes?$/, minValues: 1 },
  { name: "Waist Size", label: /^waist( sizes?)?$/, minValues: 1 },
  { name: "Age Group", label: /^(age|age groups?|age range)$/, minValues: 2 },
  { name: "Color", label: /^colou?rs?$/, minValues: 2 },
  { name: "Pack Size", label: /^(pack size|pack of)$/, minValues: 2 },
  { name: "Weight", label: /^(net )?weight$/, minValues: 2 },
  { name: "Volume", label: /^(net )?volume$/, minValues: 2 },
  { name: "Storage", label: /^(internal )?storage$/, minValues: 2 },
  { name: "Model", label: /^(models?|compatible models?)$/, minValues: 2 },
  { name: "Shade", label: /^shades?$/, minValues: 2 },
  { name: "Flavour", label: /^flavou?rs?$/, minValues: 2 },
  { name: "Fragrance", label: /^fragrances?$/, minValues: 2 },
] as const;

/** One choice the shopper makes, e.g. { name: "Color", values: ["Black", "White"] }. */
export interface ProductOption {
  name: string;
  values: string[];
}

/** The options picked, by option name, e.g. { Size: "M", Color: "Black" }. */
export type SelectedOptions = Record<string, string>;

function splitValues(spec: ProductSpec): string[] {
  return spec.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/** The option type a details row is, if it lists enough values to be a choice. */
function optionTypeOf(spec: ProductSpec) {
  const label = spec.label.trim().toLowerCase();
  const type = OPTION_TYPES.find((candidate) => candidate.label.test(label));
  return type && splitValues(spec).length >= type.minValues ? type : undefined;
}

/** True for a details row shown as option chips instead of a details row. */
export function isOptionSpec(spec: ProductSpec): boolean {
  return optionTypeOf(spec) !== undefined;
}

/** The options a product offers, in a fixed order (Size first, then Color, …). */
export function getProductOptions(product: Pick<Product, "specs">): ProductOption[] {
  const valuesByName = new Map<string, string[]>();
  for (const spec of product.specs) {
    const type = optionTypeOf(spec);
    if (!type) continue;
    const values = valuesByName.get(type.name) ?? [];
    for (const value of splitValues(spec)) if (!values.includes(value)) values.push(value);
    valuesByName.set(type.name, values);
  }
  return OPTION_TYPES.flatMap(({ name }) => {
    const values = valuesByName.get(name);
    return values ? [{ name, values }] : [];
  });
}

/** "Size: M · Color: Black", for order lines. */
export function formatOptions(options: SelectedOptions | undefined): string {
  return Object.entries(options ?? {})
    .map(([name, value]) => `${name}: ${value}`)
    .join(" · ");
}

/** Reads picked options stored in the database; undefined when there are none. */
export function toSelectedOptions(value: unknown): SelectedOptions | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}
