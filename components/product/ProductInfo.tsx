import { ProductInfoTabs } from "@/components/product/ProductInfoTabs";
import { ProductProsCons } from "@/components/product/ProductProsCons";
import { isOptionSpec } from "@/lib/product-options";
import type { Product } from "@/types";

/** The product's description and details table, in the tabs under the main box. */
export function ProductInfo({ product }: { product: Product }) {
  const specs = product.specs.filter((spec) => !isOptionSpec(spec));
  const title = product.title.trim();
  // Imported products often use the name as the description; don't repeat it.
  const description = [product.description, product.shortDescription]
    .map((text) => text.trim())
    .find((text) => text !== "" && text !== title);
  const hasProsCons = product.pros.length > 0 || product.cons.length > 0;

  const details = (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed whitespace-pre-line text-ink-muted">
        {description ?? "See the specifications for this product's details."}
      </p>
      {hasProsCons && <ProductProsCons pros={product.pros} cons={product.cons} />}
    </div>
  );

  const specifications =
    specs.length > 0 ? (
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {specs.map((spec, index) => (
          <div
            key={`${spec.label}-${index}`}
            className="flex gap-3 border-b border-line pb-3 text-sm"
          >
            <dt className="w-2/5 shrink-0 text-ink-muted">{spec.label}</dt>
            <dd className="min-w-0 break-words text-ink">{spec.value}</dd>
          </div>
        ))}
      </dl>
    ) : undefined;

  return <ProductInfoTabs details={details} specifications={specifications} />;
}
