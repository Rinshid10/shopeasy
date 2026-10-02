"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { cn } from "@/lib/cn";
import type { Product } from "@/types";

interface ProductGalleryProps {
  product: Pick<Product, "title" | "imageUrl" | "extraImageUrls">;
  /** The `sizes` hint for the large picture. */
  sizes: string;
}

/**
 * The product page's pictures: one large picture, with thumbnails underneath when the product
 * has more than one. Tapping a thumbnail shows it large.
 */
export function ProductGallery({ product, sizes }: ProductGalleryProps) {
  const pictures = [product.imageUrl, ...product.extraImageUrls].filter((url): url is string =>
    Boolean(url),
  );
  const [selected, setSelected] = useState(0);
  const shownUrl = pictures[selected] ?? product.imageUrl;

  return (
    <div className="flex flex-col gap-3">
      <ProductImage product={{ title: product.title, imageUrl: shownUrl }} sizes={sizes} preload />
      {pictures.length > 1 && (
        <ul className="grid grid-cols-4 gap-2" aria-label="More pictures">
          {pictures.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show picture ${index + 1} of ${pictures.length}`}
                aria-pressed={index === selected}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-surface",
                  index === selected ? "border-brand" : "border-line hover:border-ink-muted",
                )}
              >
                <Image src={url} alt="" fill sizes="96px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
