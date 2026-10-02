import { Card } from "@/components/ui/Card";

interface ProductSizesProps {
  sizes: string[];
}

/** The sizes the product comes in, as chips (Meesho's "Select Size" box). */
export function ProductSizes({ sizes }: ProductSizesProps) {
  return (
    <Card as="section" aria-labelledby="sizes-heading" className="flex flex-col gap-3 p-4 sm:p-5">
      <h2 id="sizes-heading" className="text-lg font-bold text-ink">
        {sizes.length === 1 ? "Size" : "Available Sizes"}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <li
            key={size}
            className="rounded-full border border-brand bg-brand-soft px-4 py-1.5 text-sm font-semibold text-brand"
          >
            {size}
          </li>
        ))}
      </ul>
    </Card>
  );
}
