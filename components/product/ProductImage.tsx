import Image from "next/image";
import { cn } from "@/lib/cn";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import type { Product } from "@/types";

type ProductImageShape = "square" | "wide";

interface ProductImageProps {
  product: Pick<Product, "title" | "imageUrl">;
  /** The `sizes` hint for next/image, matching how wide the image is laid out. */
  sizes: string;
  /** "wide" is a shorter 4:3 frame for cards; "square" is for the product page. */
  shape?: ProductImageShape;
  /** Set on the main image of a page so the browser fetches it early. */
  preload?: boolean;
}

const frameClasses: Record<ProductImageShape, string> = {
  square: "aspect-square",
  wide: "aspect-[4/3]",
};

/**
 * A product picture on a white frame. Products without one show the placeholder instead.
 * Inside a `group` link, the picture zooms slightly on hover.
 */
export function ProductImage({
  product,
  sizes,
  shape = "square",
  preload = false,
}: ProductImageProps) {
  const hasImage = product.imageUrl !== null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        frameClasses[shape],
        hasImage ? "bg-surface" : "bg-surface-muted",
      )}
    >
      <Image
        src={product.imageUrl ?? PLACEHOLDER_IMAGE}
        alt={hasImage ? product.title : `Placeholder picture for ${product.title}`}
        fill
        sizes={sizes}
        preload={preload}
        className={cn(
          "object-contain transition-transform duration-300 group-hover:scale-105",
          hasImage ? "p-2" : "p-[22%]",
        )}
      />
    </div>
  );
}
