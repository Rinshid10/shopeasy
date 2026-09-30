import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/Container";
import { SearchIcon } from "@/components/ui/icons";
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
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Categories" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded py-2 text-sm font-medium text-ink hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href={routes.search}
            aria-label="Search products"
            className="flex size-11 items-center justify-center rounded-lg text-ink hover:bg-surface-muted"
          >
            <SearchIcon className="size-6" />
          </Link>
          <MobileNav links={categoryLinks} />
        </div>
      </Container>
    </header>
  );
}
