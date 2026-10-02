import Link from "next/link";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { Logo } from "@/components/layout/Logo";
import {
  MobileBackButton,
  MobileSearchBar,
  MobileSearchButton,
} from "@/components/layout/MobileHeaderParts";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchForm } from "@/components/product/SearchForm";
import { Container } from "@/components/ui/Container";
import { HeartIcon, PackageIcon, UserIcon } from "@/components/ui/icons";
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
      <Container className="flex h-14 items-center gap-1 md:h-[4.5rem] md:gap-6 lg:gap-16 xl:gap-28">
        <MobileBackButton />
        <Logo />
        <div className="hidden max-w-4xl flex-1 md:block">
          <SearchForm />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <MobileSearchButton />
          <Link
            href={routes.orders}
            aria-label="My Orders"
            title="My Orders"
            className="hidden size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-muted md:flex md:size-11"
          >
            <PackageIcon className="size-6" />
          </Link>
          <Link
            href={routes.account}
            aria-label="My Account"
            title="My Account"
            className="hidden size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-muted md:flex md:size-11"
          >
            <UserIcon className="size-6" />
          </Link>
          <Link
            href={routes.wishlist}
            aria-label="Wishlist"
            title="Wishlist"
            className="flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-muted md:size-11"
          >
            <HeartIcon className="size-6" />
          </Link>
          <div className="hidden md:block lg:hidden">
            <MobileNav
              links={[
                { label: "My Orders", href: routes.orders },
                { label: "My Account", href: routes.account },
                { label: "Wishlist", href: routes.wishlist },
                ...categoryLinks,
              ]}
            />
          </div>
        </div>
      </Container>
      <MobileSearchBar />
      <CategoryBar links={categoryLinks} />
    </header>
  );
}
