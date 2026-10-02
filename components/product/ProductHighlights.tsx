import { ProductProsCons } from "@/components/product/ProductProsCons";
import { Card } from "@/components/ui/Card";
import { ChevronRightIcon } from "@/components/ui/icons";
import type { Product, ProductSpec } from "@/types";

/** How many details show before "Additional Details", as on Meesho. */
const HIGHLIGHT_COUNT = 4;

/** The size details ("Sizes: Free size"), shown as chips in their own box instead. */
export function isSizeSpec(spec: ProductSpec): boolean {
  return /^sizes?$/i.test(spec.label.trim());
}

/** The sizes a product comes in, e.g. ["S", "M", "L"] from "Sizes: S, M, L". */
export function getSizes(product: Pick<Product, "specs">): string[] {
  return product.specs
    .filter(isSizeSpec)
    .flatMap((spec) => spec.value.split(","))
    .map((size) => size.trim())
    .filter(Boolean);
}

function SpecGrid({ specs }: { specs: ProductSpec[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
      {specs.map((spec, index) => (
        <div key={`${spec.label}-${index}`} className="min-w-0">
          <dt className="text-xs text-ink-muted">{spec.label}</dt>
          <dd className="text-sm break-words text-ink">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface ProductHighlightsProps {
  product: Product;
}

/**
 * Meesho's "Product Highlights" box: the first few details in two columns, with the rest,
 * the description and any pros and cons under "Additional Details".
 */
export function ProductHighlights({ product }: ProductHighlightsProps) {
  const specs = product.specs.filter((spec) => !isSizeSpec(spec));
  const highlights = specs.slice(0, HIGHLIGHT_COUNT);
  const more = specs.slice(HIGHLIGHT_COUNT);
  const description = product.description.trim();
  // Imported products use the name as the description; don't repeat it.
  const showDescription = description !== "" && description !== product.title.trim();
  const hasProsCons = product.pros.length > 0 || product.cons.length > 0;
  const hasMore = more.length > 0 || showDescription || hasProsCons;

  if (highlights.length === 0 && !hasMore) {
    return null;
  }

  const moreContent = (
    <div className="flex flex-col gap-4">
      {more.length > 0 && <SpecGrid specs={more} />}
      {showDescription && (
        <div>
          <p className="text-xs text-ink-muted">Description</p>
          <p className="text-sm whitespace-pre-line text-ink">{description}</p>
        </div>
      )}
      {hasProsCons && <ProductProsCons pros={product.pros} cons={product.cons} />}
    </div>
  );

  return (
    <Card as="section" aria-labelledby="highlights-heading" className="flex flex-col p-4 sm:p-5">
      <h2 id="highlights-heading" className="mb-3 text-lg font-bold text-ink">
        {highlights.length > 0 ? "Product Highlights" : "Product Details"}
      </h2>
      {highlights.length === 0 ? (
        // Nothing to highlight: show everything straight away instead of behind a toggle.
        moreContent
      ) : (
        <>
          <SpecGrid specs={highlights} />
          {hasMore && (
            <details className="group mt-3 border-t border-line pt-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                Additional Details
                <ChevronRightIcon className="size-4 rotate-90 text-ink-muted group-open:-rotate-90" />
              </summary>
              <div className="mt-3">{moreContent}</div>
            </details>
          )}
        </>
      )}
    </Card>
  );
}
