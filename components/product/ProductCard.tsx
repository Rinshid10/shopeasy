import Link from "next/link";
import { AffiliateButton } from "@/components/product/AffiliateButton";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Card } from "@/components/ui/Card";
import { routes } from "@/lib/routes";
import type { Product } from "@/types";

const CARD_IMAGE_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card as="article" className="flex h-full flex-col p-3">
      <Link href={routes.product(product.slug)} className="group flex flex-col gap-2 rounded-lg">
        <ProductImage product={product} sizes={CARD_IMAGE_SIZES} />
        <h3 className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-brand sm:text-base">
          {product.title}
        </h3>
      </Link>
      <p className="mt-1 line-clamp-2 text-xs text-ink-muted sm:text-sm">
        {product.shortDescription}
      </p>
      <div className="mt-auto flex flex-col gap-3 pt-3">
        <ProductPrice price={product.price} />
        <AffiliateButton href={product.affiliateUrl} productTitle={product.title} size="sm" />
      </div>
    </Card>
  );
}
