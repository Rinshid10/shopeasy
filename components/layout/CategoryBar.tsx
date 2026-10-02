"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ChevronRightIcon, MenuIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";
import type { NavLink } from "@/types";

/** The desktop category links under the header. Not shown on the home page. */
export function CategoryBar({ links }: { links: NavLink[] }) {
  if (usePathname() === routes.home) return null;
  return (
    <nav aria-label="Categories" className="hidden border-t border-line lg:block">
      <Container className="flex items-center gap-6 py-2">
        <Link
          href={routes.allCategories}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-surface-muted px-4 py-2 text-sm font-semibold text-ink hover:bg-line"
        >
          <MenuIcon />
          All Categories
          <ChevronRightIcon className="size-4" />
        </Link>
        <ul className="scrollbar-none flex items-center overflow-x-auto">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-ink after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand hover:text-brand hover:after:scale-x-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
