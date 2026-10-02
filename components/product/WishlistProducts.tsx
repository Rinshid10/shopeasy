"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { HeartIcon } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/Button";
import { routes } from "@/lib/routes";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/types";

/** The hearted products as cards, newest first; tapping a heart takes one off. */
export function WishlistProducts({ products }: { products: Product[] }) {
  const { slugs, isLoaded } = useWishlist();
  if (!isLoaded) {
    return <p className="text-sm text-ink-muted">Loading your wishlist…</p>;
  }

  const hearted = slugs.flatMap((slug) => {
    const product = products.find((candidate) => candidate.slug === slug);
    return product ? [product] : [];
  });

  if (hearted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-12 text-center">
        <HeartIcon className="size-10 text-brand" />
        <p className="font-semibold text-ink">Your wishlist is empty</p>
        <p className="text-sm text-ink-muted">Tap the heart on a product to save it here.</p>
        <Link href={routes.home} className={buttonClasses({ variant: "buy", size: "md" })}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-ink-muted">
        {hearted.length} {hearted.length === 1 ? "product" : "products"}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {hearted.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}
