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
 * The product page's pictures, laid out like Meesho: a column of thumbnails beside the large
 * picture on wider screens, and a row underneath on phones. Hovering or tapping a thumbnail
 * shows it large.
 */
export function ProductGallery({ product, sizes }: ProductGalleryProps) {
  const pictures = [product.imageUrl, ...product.extraImageUrls].filter((url): url is string =>
    Boolean(url),
  );
  const [selected, setSelected] = useState(0);
  const shownUrl = pictures[selected] ?? product.imageUrl;

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:items-start">
      <div className="min-w-0 flex-1 rounded-xl border border-line bg-surface p-2">
        <ProductImage
          product={{ title: product.title, imageUrl: shownUrl }}
          sizes={sizes}
          preload
        />
      </div>
      {pictures.length > 1 && (
        <ul
          aria-label="More pictures"
          className="scrollbar-none flex gap-2 overflow-x-auto md:w-16 md:shrink-0 md:flex-col"
        >
          {pictures.map((url, index) => (
            <li key={url} className="w-16 shrink-0">
              <button
                type="button"
                onClick={() => setSelected(index)}
                onMouseEnter={() => setSelected(index)}
                aria-label={`Show picture ${index + 1} of ${pictures.length}`}
                aria-pressed={index === selected}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-surface",
                  index === selected ? "border-brand" : "border-line hover:border-ink-muted",
                )}
              >
                <Image src={url} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
