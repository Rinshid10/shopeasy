import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";
import type { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/** "Home > Category > Product", with the earlier steps as links. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="max-md:hidden">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex min-w-0 items-center gap-1">
            {index > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-ink-soft" />}
            {item.href ? (
              <Link href={item.href} className="rounded py-1 text-brand hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="max-w-[16rem] truncate py-1 text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
