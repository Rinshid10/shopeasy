"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { SaveStatus, type SaveState } from "@/components/admin/SaveStatus";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProductImage } from "@/components/product/ProductImage";
import { Card } from "@/components/ui/Card";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { setProductStock } from "@/lib/admin/actions";
import { getStockLevel, stockLevelDisplay, type StockLevel } from "@/lib/admin/labels";
import type { AdminProduct } from "@/lib/admin/queries";
import { routes } from "@/lib/routes";

type LevelFilter = StockLevel | "all";

interface InventoryListProps {
  products: AdminProduct[];
}

const stepClasses =
  "pressable flex size-9 items-center justify-center text-ink hover:bg-surface-muted disabled:text-ink-soft";

/** Stock for every product, with quick + and − adjustments and low/out-of-stock filters. */
export function InventoryList({ products }: InventoryListProps) {
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((product) => [product.slug, product.inventory.stock])),
  );
  const [filter, setFilter] = useState<LevelFilter>("all");
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const saveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const levelOf = (product: AdminProduct) =>
    getStockLevel(stock[product.slug], product.inventory.lowStockThreshold);
  const countOf = (level: StockLevel) => products.filter((p) => levelOf(p) === level).length;
  const visible = products.filter((product) => filter === "all" || levelOf(product) === filter);

  function adjust(slug: string, change: number) {
    const nextStock = Math.max(0, stock[slug] + change);
    setStock((current) => ({ ...current, [slug]: nextStock }));
    setSaveState({ status: "saving" });

    // Save once the taps on this product pause, rather than on every tap.
    clearTimeout(saveTimers.current.get(slug));
    saveTimers.current.set(
      slug,
      setTimeout(async () => {
        saveTimers.current.delete(slug);
        const result = await setProductStock(slug, nextStock);
        setSaveState(
          result.ok
            ? { status: "saved", text: "Stock saved." }
            : { status: "error", error: result.error },
        );
      }, 600),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterTabs
        label="Filter by stock level"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: "all", label: "All", count: products.length },
          { value: "low", label: "Low stock", count: countOf("low") },
          { value: "out", label: "Out of stock", count: countOf("out") },
          { value: "in-stock", label: "In stock", count: countOf("in-stock") },
        ]}
      />
      <SaveStatus state={saveState} />
      {visible.length === 0 ? (
        <EmptyState title="Nothing here" text="No products match this stock level." />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {visible.map((product) => (
              <li key={product.slug} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="w-12 shrink-0">
                  <ProductImage product={product} sizes="48px" decorative />
                </div>
                <Link
                  href={routes.admin.product(product.slug)}
                  className="flex min-w-0 flex-1 flex-col hover:text-brand"
                >
                  <span className="truncate text-sm font-semibold text-ink">{product.title}</span>
                  <span className="text-xs text-ink-muted">
                    {product.inventory.sku} · alert at {product.inventory.lowStockThreshold}
                  </span>
                </Link>
                <StatusBadge status={stockLevelDisplay[levelOf(product)]} />
                <div className="flex items-center overflow-hidden rounded-lg border border-line">
                  <button
                    type="button"
                    aria-label={`Remove one ${product.title} from stock`}
                    disabled={stock[product.slug] === 0}
                    onClick={() => adjust(product.slug, -1)}
                    className={stepClasses}
                  >
                    <MinusIcon className="size-4" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-bold text-ink tabular-nums">
                    {stock[product.slug]}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add one ${product.title} to stock`}
                    onClick={() => adjust(product.slug, 1)}
                    className={stepClasses}
                  >
                    <PlusIcon className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => adjust(product.slug, 10)}
                  className="pressable rounded-lg border border-line px-2.5 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
                >
                  +10
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
