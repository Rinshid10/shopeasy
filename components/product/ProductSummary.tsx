import { BuyNowButton } from "@/components/product/BuyNowButton";
import { ProductOptions } from "@/components/product/ProductOptions";
import { QuantityPicker } from "@/components/product/QuantityPicker";
import { Card } from "@/components/ui/Card";
import { CashIcon, TagIcon, TruckIcon } from "@/components/ui/icons";
import { StarRating } from "@/components/ui/StarRating";
import { formatPrice, getDiscountPercent } from "@/lib/format";
import type { ProductOption } from "@/lib/product-options";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types";

interface ProductSummaryProps {
  product: Product;
  options: ProductOption[];
}

/**
 * The product page's main box: name, rating, price, the options to pick, quantity, the shop's
 * promises and Buy Now (on phones Buy Now is in the bar at the bottom instead).
 */
export function ProductSummary({ product, options }: ProductSummaryProps) {
  const { demoStore, store, locale } = siteConfig;
  const discount = getDiscountPercent(product.price, product.mrp);
  // The shop's own customer rating first; otherwise Meesho's, labelled as such.
  const rating =
    product.rating !== undefined
      ? { value: product.rating, count: product.ratingCount, source: undefined }
      : product.meesho
        ? { value: product.meesho.rating, count: product.meesho.ratingCount, source: "Meesho" }
        : null;
  const description = product.shortDescription.trim();
  const promises = [
    ...(store.deliveryCharge === 0
      ? [{ title: "Free Delivery", text: "On every order", Icon: TruckIcon }]
      : []),
    { title: "Lowest Price", text: "Best value on our range", Icon: TagIcon },
    { title: "Cash on Delivery", text: "Pay when it arrives", Icon: CashIcon },
  ];

  return (
    <Card className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl leading-snug font-bold text-ink sm:text-2xl">{product.title}</h1>
        {rating && (
          <a href="#reviews" className="flex w-fit flex-wrap items-center gap-2 text-sm">
            <StarRating rating={rating.value} />
            <span className="font-semibold text-ink">{rating.value.toFixed(1)}</span>
            {rating.count !== undefined && (
              <span className="text-ink-muted">
                ({rating.count.toLocaleString(locale)} {rating.count === 1 ? "rating" : "ratings"}
                {rating.source && ` on ${rating.source}`})
              </span>
            )}
          </a>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-3xl font-bold tracking-tight text-brand">
            {formatPrice(product.price)}
          </span>
          {product.mrp !== undefined && discount !== null && (
            <>
              <span className="text-lg text-ink-muted">
                <span className="sr-only">MRP </span>
                <s>{formatPrice(product.mrp)}</s>
              </span>
              <span className="rounded-md bg-positive-soft px-2 py-1 text-sm font-semibold text-positive">
                {discount}% OFF
              </span>
            </>
          )}
        </p>
        {description && description !== product.title.trim() && (
          <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>

      {options.length > 0 && <ProductOptions productSlug={product.slug} options={options} />}
      <QuantityPicker productSlug={product.slug} />

      <ul className="grid grid-cols-3 gap-2 border-y border-line py-4">
        {promises.map(({ title, text, Icon }) => (
          <li key={title} className="flex items-start gap-2">
            <Icon className="mt-0.5 size-5 shrink-0 text-brand" />
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold text-ink sm:text-sm">{title}</span>
              <span className="text-[0.6875rem] text-ink-muted sm:text-xs">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="max-md:hidden">
        <BuyNowButton
          productSlug={product.slug}
          productTitle={product.title}
          options={options}
          onProductPage
          size="lg"
        />
      </div>
      {demoStore.isEnabled && <p className="text-xs text-ink-muted">{demoStore.catalogueNote}</p>}
    </Card>
  );
}
