"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchForm } from "@/components/product/SearchForm";
import { ChevronLeftIcon, SearchIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";

// The phone header works like a shopping app's: the tab pages (Home, Categories, My Orders,
// Account) show the logo, while pages opened from them show a back arrow. Browsing pages
// have a search bar under the logo; other pages have a search button instead.

const TAB_PAGES: string[] = [routes.home, routes.categories, routes.orders, routes.account];

function isBrowsingPage(pathname: string): boolean {
  return (
    pathname === routes.home ||
    pathname === routes.categories ||
    pathname === routes.search ||
    pathname.startsWith("/category/")
  );
}

/** A back arrow on pages opened from a tab; returns to where the shopper came from. */
export function MobileBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  if (TAB_PAGES.includes(pathname)) return null;

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(routes.home);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-surface-muted md:hidden"
    >
      <ChevronLeftIcon className="size-6" />
    </button>
  );
}

/** The search button, on phone pages that have no search bar. */
export function MobileSearchButton() {
  if (isBrowsingPage(usePathname())) return null;
  return (
    <Link
      href={routes.search}
      aria-label="Search products"
      className="flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-muted md:hidden"
    >
      <SearchIcon className="size-6" />
    </Link>
  );
}

/** The full-width search bar under the logo, on phone browsing pages. */
export function MobileSearchBar() {
  if (!isBrowsingPage(usePathname())) return null;
  return (
    <div className="px-4 pb-3 md:hidden">
      <SearchForm />
    </div>
  );
}
