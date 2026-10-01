import Link from "next/link";
import { BuyNowButton } from "@/components/product/BuyNowButton";
import { getProductImageTransitionName, ProductImage } from "@/components/product/ProductImage";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductRating } from "@/components/product/ProductRating";
import { Card } from "@/components/ui/Card";
import { routes } from "@/lib/routes";
import type { Product } from "@/types";

const CARD_IMAGE_SIZES = "(min-width: 1536px) 12vw, (min-width: 768px) 25vw, 50vw";

interface ProductCardProps {
  product: Product;
  /**
   * Let the picture glide into the product page. Turn off for repeat appearances of a
   * product on the same page: each picture name may appear only once per page.
   */
  morph?: boolean;
}

export function ProductCard({ product, morph = true }: ProductCardProps) {
  return (
    <Card
      as="article"
      className="flex h-full reveal flex-col p-2.5 transition-[box-shadow,translate,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-ink/10 sm:p-3"
    >
      <Link
        href={routes.product(product.slug)}
        className="group flex pressable flex-col gap-2 rounded-xl"
      >
        <ProductImage
          product={product}
          sizes={CARD_IMAGE_SIZES}
          shape="wide"
          transitionName={morph ? getProductImageTransitionName(product.slug) : undefined}
        />
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-ink transition-colors group-hover:text-brand">
          {product.title}
        </h3>
      </Link>
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {product.rating !== undefined && (
          <ProductRating rating={product.rating} count={product.ratingCount} />
        )}
        <ProductPrice price={product.price} mrp={product.mrp} />
        <BuyNowButton productSlug={product.slug} productTitle={product.title} size="sm" compact />
      </div>
    </Card>
  );
}
