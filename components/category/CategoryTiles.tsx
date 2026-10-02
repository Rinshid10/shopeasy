import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { routes } from "@/lib/routes";
import type { Category, CategoryTint } from "@/types";

const tintClasses: Record<CategoryTint, string> = {
  sky: "bg-tint-sky",
  lavender: "bg-tint-lavender",
  pink: "bg-tint-pink",
  mint: "bg-tint-mint",
  peach: "bg-tint-peach",
  cream: "bg-tint-cream",
  blue: "bg-tint-blue",
};

interface CategoryTilesProps {
  categories: Category[];
}

/** Pastel category cards: four small ones per row on phones, up to eight per row on wide screens. */
export function CategoryTiles({ categories }: CategoryTilesProps) {
  return (
    <ul className="grid grid-cols-4 gap-2 sm:gap-4 2xl:grid-cols-8">
      {categories.map((category) => (
        <li key={category.slug}>
          <Link
            href={routes.category(category.slug)}
            className={cn(
              "group flex h-full flex-col gap-1 rounded-2xl p-1.5 hover:-translate-y-1 hover:shadow-lg sm:gap-2 sm:p-3",
              tintClasses[category.tint],
            )}
          >
            <span className="relative block h-12 sm:h-24">
              <Image
                src={category.imageUrl ?? PLACEHOLDER_IMAGE}
                alt=""
                fill
                sizes="(min-width: 640px) 200px, 25vw"
                className="object-contain group-hover:scale-105"
              />
            </span>
            <span className="flex flex-1 items-center justify-between gap-2">
              <span className="text-[11px] leading-tight font-semibold text-ink max-sm:w-full max-sm:text-center sm:text-sm">
                {category.name}
              </span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-sm group-hover:translate-x-0.5 max-sm:hidden">
                <ChevronRightIcon className="size-4" />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
