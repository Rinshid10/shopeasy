import type { ProductSpec } from "@/types";

interface ProductSpecsProps {
  specs: ProductSpec[];
}

/** The product's details (Color, Material, Size...) as a two-column table. */
export function ProductSpecs({ specs }: ProductSpecsProps) {
  return (
    <dl className="grid overflow-hidden rounded-xl border border-line text-sm sm:grid-cols-2">
      {specs.map((spec, index) => (
        <div
          key={`${spec.label}-${index}`}
          className="flex gap-3 border-b border-line px-4 py-2.5 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
        >
          <dt className="w-2/5 shrink-0 text-ink-muted">{spec.label}</dt>
          <dd className="font-medium text-ink">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
