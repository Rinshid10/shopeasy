import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchForm } from "@/components/product/SearchForm";
import { Container } from "@/components/ui/Container";
import { ChevronRightIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { getCategories } from "@/lib/categories";
import { routes } from "@/lib/routes";
import type { NavLink } from "@/types";

export async function Header() {
  const categories = await getCategories();
  const categoryLinks: NavLink[] = categories.map((category) => ({
    label: category.name,
    href: routes.category(category.slug),
  }));

  return (
    <header
      className="sticky top-0 z-40 header-elevate border-b border-line bg-surface"
      style={{ viewTransitionName: "site-header" }}
    >
      <Container className="flex h-14 items-center gap-6 md:h-[4.5rem] lg:gap-16 xl:gap-28">
        <Logo />
        <div className="hidden max-w-4xl flex-1 md:block">
          <SearchForm />
        </div>
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <Link
            href={routes.search}
            aria-label="Search products"
            className="flex size-10 pressable items-center justify-center rounded-lg text-ink hover:bg-surface-muted md:hidden"
          >
            <SearchIcon className="size-6" />
          </Link>
          <MobileNav links={categoryLinks} />
        </div>
      </Container>
      <nav aria-label="Categories" className="hidden border-t border-line lg:block">
        <Container className="flex items-center gap-6 py-2">
          <Link
            href={routes.allCategories}
            className="flex shrink-0 pressable items-center gap-2 rounded-xl bg-surface-muted px-4 py-2 text-sm font-semibold text-ink hover:bg-line"
          >
            <MenuIcon />
            All Categories
            <ChevronRightIcon className="size-4" />
          </Link>
          <ul className="scrollbar-none flex items-center overflow-x-auto">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-ink transition-colors after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 hover:text-brand hover:after:scale-x-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </header>
  );
}
