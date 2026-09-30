import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";
import type { Category } from "@/types";

interface CategoryTilesProps {
  categories: Category[];
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {categories.map((category) => (
        <li key={category.slug}>
          <Link
            href={routes.category(category.slug)}
            className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-brand-soft p-4 transition-colors hover:border-brand"
          >
            <span className="flex items-start justify-between gap-2 font-semibold text-ink group-hover:text-brand">
              {category.name}
              <ChevronRightIcon className="mt-0.5 size-5 shrink-0 text-brand" />
            </span>
            <span className="line-clamp-3 text-xs text-ink-muted sm:text-sm">
              {category.description}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
