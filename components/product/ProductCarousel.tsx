"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { Product } from "@/types";

interface ProductCarouselProps {
  products: Product[];
  /** Describes the row for screen readers, e.g. "Biggest discounts". */
  label: string;
  /** See ProductCard: off when these products also appear elsewhere on the page. */
  morph?: boolean;
}

const arrowClasses =
  "pressable absolute top-1/3 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lg hover:border-brand hover:text-brand md:flex";

/** A row of product cards that swipes sideways on phones and has arrow buttons on larger screens. */
export function ProductCarousel({ products, label, morph = true }: ProductCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (track) {
      track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Scroll ${label} left`}
        onClick={() => scrollByPage(-1)}
        className={`${arrowClasses} -left-4`}
      >
        <ChevronLeftIcon />
      </button>
      <ul
        ref={trackRef}
        aria-label={label}
        className="-mx-4 scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {products.map((product) => (
          <li key={product.slug} className="w-40 shrink-0 snap-start sm:w-48 lg:w-52">
            <ProductCard product={product} morph={morph} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-label={`Scroll ${label} right`}
        onClick={() => scrollByPage(1)}
        className={`${arrowClasses} -right-4`}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
