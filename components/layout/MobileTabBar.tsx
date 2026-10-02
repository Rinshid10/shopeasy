"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GridIcon, HomeIcon, PackageIcon, UserIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

interface Tab {
  label: string;
  href: string;
  icon: ReactNode;
  /** Other pages that belong to this tab. */
  matches: (pathname: string) => boolean;
}

const TABS: Tab[] = [
  {
    label: "Home",
    href: routes.home,
    icon: <HomeIcon className="size-6" />,
    matches: (pathname) => pathname === routes.home,
  },
  {
    label: "Categories",
    href: routes.categories,
    icon: <GridIcon className="size-6" />,
    matches: (pathname) =>
      pathname === routes.categories ||
      pathname.startsWith("/category/") ||
      pathname === routes.search,
  },
  {
    label: "My Orders",
    href: routes.orders,
    icon: <PackageIcon className="size-6" />,
    matches: (pathname) => pathname.startsWith(routes.orders),
  },
  {
    label: "Account",
    href: routes.account,
    icon: <UserIcon className="size-6" />,
    matches: (pathname) => pathname.startsWith(routes.account),
  },
];

/**
 * The phone's bottom tab bar, as in a shopping app. Pages with their own bottom bar (a
 * product's Buy Now, checkout's Continue) hide it; see globals.css.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout")) return null;

  return (
    <nav
      aria-label="Main"
      className="bottom-tab-bar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const isActive = tab.matches(pathname);
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
      </ul>
    </nav>
  );
}
