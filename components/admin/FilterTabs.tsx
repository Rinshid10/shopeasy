"use client";

import { cn } from "@/lib/cn";

export interface FilterTab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/** A row of pill buttons that filters a list, one chosen at a time; scrolls sideways on phones. */
export function FilterTabs<T extends string>({ tabs, value, onChange, label }: FilterTabsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {tabs.map((tab) => {
        const isSelected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex shrink-0 pressable items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap",
              isSelected
                ? "border-ink bg-ink text-surface"
                : "border-line bg-surface text-ink hover:border-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  isSelected ? "bg-surface/20" : "bg-surface-muted text-ink-muted",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
