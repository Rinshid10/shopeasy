"use client";

import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

interface ProductInfoTabsProps {
  /** The "Product Details" tab: the description, pros and cons. */
  details: ReactNode;
  /** The "Specifications" tab: the details table. Left out when there are none. */
  specifications?: ReactNode;
}

type TabKey = "details" | "specifications";

/** "Product Details | Specifications | Reviews & Ratings"; the last jumps to the reviews. */
export function ProductInfoTabs({ details, specifications }: ProductInfoTabsProps) {
  const [active, setActive] = useState<TabKey>("details");
  const tabs: { key: TabKey; label: string }[] = [
    { key: "details", label: "Product Details" },
    ...(specifications ? [{ key: "specifications" as const, label: "Specifications" }] : []),
  ];
  const tabClasses = "-mb-px shrink-0 border-b-2 px-1 py-3 text-sm font-semibold sm:text-base";

  return (
    <Card as="section" aria-label="Product information" className="flex flex-col p-4 sm:p-6">
      <div
        role="tablist"
        className="scrollbar-none flex gap-6 overflow-x-auto border-b border-line sm:gap-10"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={active === tab.key}
            aria-controls={`panel-${tab.key}`}
            onClick={() => setActive(tab.key)}
            className={cn(
              tabClasses,
              active === tab.key
                ? "border-brand text-brand"
                : "border-transparent text-ink hover:text-brand",
            )}
          >
            {tab.label}
          </button>
        ))}
        <a
          href="#reviews"
          className={cn(tabClasses, "border-transparent text-ink hover:text-brand")}
        >
          Reviews &amp; Ratings
        </a>
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`panel-${tab.key}`}
          aria-labelledby={`tab-${tab.key}`}
          hidden={active !== tab.key}
          className="mt-4 rounded-xl bg-surface-muted p-4 sm:p-5"
        >
          {tab.key === "details" ? details : specifications}
        </div>
      ))}
    </Card>
  );
}
