"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { fieldControlClasses } from "@/components/checkout/FormField";
import { ProductImage } from "@/components/product/ProductImage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TrashIcon } from "@/components/ui/icons";
import { deleteProduct } from "@/lib/admin/actions";
import { getStockLevel, listingStatusDisplay, stockLevelDisplay } from "@/lib/admin/labels";
import type { AdminProduct } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Category } from "@/types";

interface ProductsTableProps {
  products: AdminProduct[];
  categories: Category[];
}

/** The catalogue, searchable by name or SKU and filterable by category, with a delete button per row. */
export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState("all");
  const [deletedSlugs, setDeletedSlugs] = useState<string[]>([]);
  const [confirmingSlug, setConfirmingSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        !deletedSlugs.includes(product.slug) &&
        (categorySlug === "all" || product.categorySlug === categorySlug) &&
        `${product.title} ${product.inventory.sku}`.toLowerCase().includes(needle),
    );
  }, [products, query, categorySlug, deletedSlugs]);

  async function confirmDelete(slug: string) {
    setDeletingSlug(slug);
    setDeleteError(null);
    const result = await deleteProduct(slug);
    setDeletingSlug(null);
    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }
    setDeletedSlugs((slugs) => [...slugs, slug]);
    setConfirmingSlug(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} label="Search name or SKU" />
        <label className="sr-only" htmlFor="category-filter">
          Category
        </label>
        <select
          id="category-filter"
          value={categorySlug}
          onChange={(event) => setCategorySlug(event.target.value)}
          className={`${fieldControlClasses(false)} h-11 sm:max-w-56 sm:text-sm`}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <p aria-live="polite" className="text-sm text-ink-muted">
        {visible.length} {visible.length === 1 ? "product" : "products"}
      </p>
      {visible.length === 0 ? (
        <EmptyState title="No products found" text="Try another search or category." />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {visible.map((product) => {
              const { stock, lowStockThreshold, sku, listingStatus } = product.inventory;
              return (
                <li key={product.slug}>
                  <div className="flex items-center hover:bg-surface-muted">
                    <Link
                      href={routes.admin.product(product.slug)}
                      className="grid min-w-0 flex-1 grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-3 pl-4 md:grid-cols-[3.5rem_2fr_1fr_1fr_1fr_auto]"
                    >
                      <ProductImage product={product} sizes="56px" decorative />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-ink">
                          {product.title}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {sku} · {categoryName(product.categorySlug)}
                        </span>
                      </span>
                      <span className="flex flex-col text-sm max-md:hidden">
                        <span className="font-bold text-ink tabular-nums">
                          {formatPrice(product.price)}
                        </span>
                        {product.mrp && (
                          <s className="text-xs text-ink-muted tabular-nums">
                            {formatPrice(product.mrp)}
                          </s>
                        )}
                      </span>
                      <span className="flex flex-col gap-1 text-sm max-md:hidden">
                        <span className="text-ink tabular-nums">{stock} in stock</span>
                      </span>
                      <span className="max-md:hidden">
                        <StatusBadge
                          status={stockLevelDisplay[getStockLevel(stock, lowStockThreshold)]}
                        />
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-ink tabular-nums md:hidden">
                          {formatPrice(product.price)}
                        </span>
                        <StatusBadge status={listingStatusDisplay[listingStatus]} />
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingSlug(product.slug);
                        setDeleteError(null);
                      }}
                      aria-label={`Delete ${product.title}`}
                      title="Delete product"
                      className="mx-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-negative-soft hover:text-negative"
                    >
                      <TrashIcon className="size-5" />
                    </button>
                  </div>
                  {confirmingSlug === product.slug && (
                    <div
                      role="group"
                      aria-label={`Delete ${product.title}?`}
                      className="flex flex-wrap items-center gap-3 border-t border-negative/30 bg-negative-soft/40 px-4 py-3"
                    >
                      <p className="min-w-0 flex-1 text-sm text-ink">
                        Delete <span className="font-semibold">{product.title}</span>? It disappears
                        from the shop with its pictures and reviews. Past orders keep their details.
                        This can&apos;t be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deletingSlug === product.slug}
                          onClick={() => setConfirmingSlug(null)}
                        >
                          Keep
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={deletingSlug === product.slug}
                          onClick={() => void confirmDelete(product.slug)}
                        >
                          {deletingSlug === product.slug ? "Deleting…" : "Yes, delete"}
                        </Button>
                      </div>
                      {deleteError && (
                        <p role="alert" className="w-full text-sm text-negative">
                          {deleteError}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
