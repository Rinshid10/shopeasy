import Link from "next/link";
import { AffiliateButton } from "@/components/product/AffiliateButton";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductRating } from "@/components/product/ProductRating";
import { Card } from "@/components/ui/Card";
import { routes } from "@/lib/routes";
import type { Product } from "@/types";

const CARD_IMAGE_SIZES = "(min-width: 1536px) 12vw, (min-width: 768px) 25vw, 50vw";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card
      as="article"
      className="flex h-full flex-col p-2.5 transition-shadow duration-200 hover:shadow-lg sm:p-3"
    >
      <Link href={routes.product(product.slug)} className="group flex flex-col gap-2 rounded-xl">
        <ProductImage product={product} sizes={CARD_IMAGE_SIZES} shape="wide" />
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-ink group-hover:underline">
          {product.title}
        </h3>
      </Link>
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {product.rating !== undefined && (
          <ProductRating rating={product.rating} count={product.ratingCount} />
        )}
        <ProductPrice price={product.price} mrp={product.mrp} />
        <AffiliateButton
          href={product.affiliateUrl}
          productTitle={product.title}
          size="sm"
          compact
        />
      </div>
    </Card>
  );
}
