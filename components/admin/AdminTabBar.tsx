"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminMobileMenu } from "@/components/admin/AdminMobileMenu";
import { GridIcon, PackageIcon, TagIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

const TABS: { label: string; href: string; icon: ReactNode }[] = [
  { label: "Dashboard", href: routes.admin.dashboard, icon: <GridIcon className="size-6" /> },
  { label: "Orders", href: routes.admin.orders, icon: <PackageIcon className="size-6" /> },
  { label: "Products", href: routes.admin.products, icon: <TagIcon className="size-6" /> },
];

/** The admin's bottom tab bar on phones and tablets; "More" opens every other section. */
export function AdminTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const isActive =
            tab.href === routes.admin.dashboard
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold",
                  isActive ? "text-brand" : "text-ink-muted",
                )}
              >
                {tab.icon}
                {tab.label}
              </Link>
            </li>
          );
        })}
        <li>
          <AdminMobileMenu />
        </li>
      </ul>
    </nav>
  );
}
