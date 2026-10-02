"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CashIcon,
  CubeIcon,
  GridIcon,
  PackageIcon,
  ReturnIcon,
  SettingsIcon,
  StarIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

interface AdminNavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: routes.admin.dashboard, icon: <GridIcon /> },
  { label: "Orders", href: routes.admin.orders, icon: <PackageIcon /> },
  { label: "Products", href: routes.admin.products, icon: <TagIcon /> },
  { label: "Inventory", href: routes.admin.inventory, icon: <CubeIcon /> },
  { label: "Customers", href: routes.admin.customers, icon: <UsersIcon /> },
  { label: "Coupons", href: routes.admin.coupons, icon: <TicketIcon /> },
  { label: "Returns", href: routes.admin.returns, icon: <ReturnIcon /> },
  { label: "Reviews", href: routes.admin.reviews, icon: <StarIcon /> },
  { label: "Payments", href: routes.admin.payments, icon: <CashIcon /> },
  { label: "Settings", href: routes.admin.settings, icon: <SettingsIcon /> },
];

/** The dashboard link is active only on itself; other sections also cover their sub-pages. */
function isActive(pathname: string, href: string): boolean {
  return href === routes.admin.dashboard ? pathname === href : pathname.startsWith(href);
}

interface AdminNavListProps {
  /** Called after a link is chosen, e.g. to close the phone menu. */
  onNavigate?: () => void;
}

/** The admin sections, with the current one highlighted. Used by the sidebar and phone menu. */
export function AdminNavList({ onNavigate }: AdminNavListProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                active
                  ? "bg-brand-soft font-semibold text-brand-strong"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              <span className={cn("shrink-0", active ? "text-brand" : "text-ink-soft")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
