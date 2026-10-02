"use client";

import { cn } from "@/lib/cn";
import { SELECT_OPTIONS_ID, selectOption, useSelectedOptions } from "@/lib/option-selection";
import type { ProductOption } from "@/lib/product-options";

/** Colours shown as swatches; other values (e.g. "Multicolor") show as boxes with the name. */
const SWATCHES: Record<string, string> = {
  black: "#111827",
  white: "#ffffff",
  grey: "#9ca3af",
  gray: "#9ca3af",
  silver: "#c0c4cc",
  red: "#dc2626",
  maroon: "#7f1d1d",
  pink: "#f472b6",
  purple: "#7e22ce",
  violet: "#8b5cf6",
  blue: "#2563eb",
  navy: "#1e3a8a",
  "navy blue": "#1e3a8a",
  "sky blue": "#7dd3fc",
  green: "#16a34a",
  olive: "#65a30d",
  yellow: "#facc15",
  mustard: "#ca8a04",
  orange: "#f97316",
  peach: "#fdba74",
  brown: "#92400e",
  beige: "#e7d7b9",
  cream: "#fdf6e3",
  gold: "#d4a017",
};

function swatchOf(optionName: string, value: string): string | undefined {
  return optionName === "Color" ? SWATCHES[value.trim().toLowerCase()] : undefined;
}

interface ProductOptionsProps {
  productSlug: string;
  options: ProductOption[];
}

/**
 * The choices to make before Buy Now (Size, Color, …): colours as round swatches, the rest
 * as boxes. "Color: Black" beside the label shows what's picked.
 */
export function ProductOptions({ productSlug, options }: ProductOptionsProps) {
  const { selected, missing, isAsked } = useSelectedOptions(productSlug, options);
  const showMissing = isAsked && missing.length > 0;
  return (
    <div
      id={SELECT_OPTIONS_ID}
      className={cn(
        "flex scroll-mt-32 flex-col gap-4",
        showMissing && "rounded-xl outline-2 outline-offset-8 outline-negative",
      )}
    >
      {options.map((option) => {
        const labelId = `option-${option.name.toLowerCase().replace(/\s+/g, "-")}`;
        const isMissing = showMissing && missing.includes(option.name);
        return (
          <div key={option.name} className="flex flex-col gap-2">
            <p id={labelId} className="text-sm font-semibold text-ink">
              {option.name}:{" "}
              <span className="font-normal text-ink-muted">
                {selected[option.name] ?? `Select ${option.name.toLowerCase()}`}
              </span>
            </p>
            <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-3">
              {option.values.map((value) => {
                const isSelected = selected[option.name] === value;
                const swatch = swatchOf(option.name, value);
                const pick = () => selectOption(productSlug, option.name, value);
                return swatch ? (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={value}
                    title={value}
                    onClick={pick}
                    className={cn(
                      "size-9 rounded-full border-2 p-0.5",
                      isSelected ? "border-brand" : "border-line hover:border-ink-muted",
                    )}
                  >
                    <span
                      className="block size-full rounded-full border border-line"
                      style={{ backgroundColor: swatch }}
                    />
                  </button>
                ) : (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={pick}
                    className={cn(
                      "min-w-14 rounded-lg border px-4 py-2 text-sm font-medium",
                      isSelected
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-line bg-surface text-ink hover:border-ink-muted",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            {isMissing && (
              <p role="alert" className="text-sm font-medium text-negative">
                Please select a {option.name.toLowerCase()} to continue.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
