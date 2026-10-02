"use client";

import Image from "next/image";
import { useState, type UIEvent } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { WishlistButton } from "@/components/product/WishlistButton";
import { cn } from "@/lib/cn";
import type { Product } from "@/types";

interface ProductGalleryProps {
  product: Pick<Product, "slug" | "title" | "imageUrl" | "extraImageUrls">;
  /** The `sizes` hint for the large picture. */
  sizes: string;
}

/**
 * The product page's pictures. On phones, as in a shopping app: full width, swiped sideways,
 * with dots below. On wider screens: the large picture with a row of thumbnails underneath;
 * hovering or clicking a thumbnail shows it large. Both have the wishlist heart.
 */
export function ProductGallery({ product, sizes }: ProductGalleryProps) {
  const pictures = [product.imageUrl, ...product.extraImageUrls].filter((url): url is string =>
    Boolean(url),
  );
  const [selected, setSelected] = useState(0);
  const [swiped, setSwiped] = useState(0);
  const shownUrl = pictures[selected] ?? product.imageUrl;

  function trackSwipe(event: UIEvent<HTMLUListElement>) {
    const strip = event.currentTarget;
    setSwiped(Math.round(strip.scrollLeft / strip.clientWidth));
  }

  return (
    <>
      {/* Phones: swipe through full-width pictures. */}
      <div className="relative -mx-4 -mt-4 bg-surface sm:-mx-6 md:hidden">
        <WishlistButton
          productSlug={product.slug}
          productTitle={product.title}
          className="absolute top-3 right-3 z-10 size-10"
        />
        {pictures.length > 1 ? (
          <>
            <ul
              aria-label="Pictures, swipe to see more"
              onScroll={trackSwipe}
              className="relative scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
            >
              {pictures.map((url, index) => (
                <li key={url} className="w-full shrink-0 snap-center">
                  <ProductImage
                    product={{ title: `${product.title}, picture ${index + 1}`, imageUrl: url }}
                    sizes="100vw"
                    preload={index === 0}
                  />
                </li>
              ))}
            </ul>
            <p className="flex justify-center gap-1.5 pb-3" aria-hidden="true">
              {pictures.map((url, index) => (
                <span
                  key={url}
                  className={cn("size-2 rounded-full", index === swiped ? "bg-brand" : "bg-line")}
                />
              ))}
            </p>
          </>
        ) : (
          <ProductImage product={product} sizes="100vw" preload />
        )}
      </div>

      {/* Wider screens: the large picture, with thumbnails underneath. */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 max-md:hidden">
        <div className="relative overflow-hidden rounded-xl bg-surface-muted">
          <WishlistButton
            productSlug={product.slug}
            productTitle={product.title}
            className="absolute top-3 right-3 z-10 size-10"
          />
          <ProductImage
            product={{ title: product.title, imageUrl: shownUrl }}
            sizes={sizes}
            preload
          />
        </div>
        {pictures.length > 1 && (
          <ul aria-label="More pictures" className="flex flex-wrap gap-3">
            {pictures.map((url, index) => (
              <li key={url} className="w-20">
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
                  <Image src={url} alt="" fill sizes="80px" className="object-contain p-1" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
