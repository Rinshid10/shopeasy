import Image from "next/image";
import type { Product } from "@/types";

const PLACEHOLDER_IMAGE_SRC = "/images/product-placeholder.svg";

interface ProductImageProps {
  product: Pick<Product, "title" | "imageUrl">;
  /** The `sizes` hint for next/image, matching how wide the image is laid out. */
  sizes: string;
  /** Set on the main image of a page so the browser fetches it early. */
  preload?: boolean;
}

export function ProductImage({ product, sizes, preload = false }: ProductImageProps) {
  const hasImage = product.imageUrl !== null;

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted">
      <Image
        src={product.imageUrl ?? PLACEHOLDER_IMAGE_SRC}
        alt={hasImage ? product.title : `Placeholder image for ${product.title}`}
        fill
        sizes={sizes}
        preload={preload}
        className="object-contain"
      />
    </div>
  );
}
