import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertIcon,
  ChevronRightIcon,
  CubeIcon,
  PackageIcon,
  ReturnIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface ActionItem {
  label: string;
  count: number;
  href: string;
  icon: "orders" | "ship" | "returns" | "stock";
}

const ICONS: Record<ActionItem["icon"], ReactNode> = {
  orders: <PackageIcon />,
  ship: <CubeIcon />,
  returns: <ReturnIcon />,
  stock: <AlertIcon />,
};

interface ActionItemsProps {
  items: ActionItem[];
}

/** The "needs attention" strip: each tile counts work waiting and opens the matching screen. */
export function ActionItems({ items }: ActionItemsProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const isClear = item.count === 0;
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              className={cn(
                "group flex h-full pressable items-center gap-3 rounded-2xl border p-3 hover:shadow-md sm:p-4",
                isClear ? "border-line bg-surface" : "border-warning/30 bg-warning-soft",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  isClear ? "bg-surface-muted text-ink-muted" : "bg-surface text-warning",
                )}
              >
                {ICONS[item.icon]}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-xl font-extrabold text-ink tabular-nums">{item.count}</span>
                <span className="text-xs font-medium text-ink-muted">{item.label}</span>
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
