import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ChevronRightIcon } from "@/components/ui/icons";
import { getCategories } from "@/lib/categories";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "All Categories",
  description: `Every category on ${siteConfig.name}: fashion, home, beauty, electronics and more.`,
  path: routes.categories,
});

/** Every category as a list, for the phone's Categories tab. */
export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <Container width="narrow" className="flex flex-col gap-4 py-4 sm:py-6">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">All Categories</h1>
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={routes.category(category.slug)}
              className="flex items-center gap-4 p-3 hover:bg-surface-muted"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                <Image
                  src={category.imageUrl ?? PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold text-ink">{category.name}</span>
                <span className="truncate text-xs text-ink-muted">{category.description}</span>
              </span>
              <ChevronRightIcon className="size-5 shrink-0 text-ink-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
