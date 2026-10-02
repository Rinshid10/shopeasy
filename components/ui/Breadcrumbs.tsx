import Link from "next/link";
import type { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/** "Home / Category / Product", with the earlier steps as purple links. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex min-w-0 items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="text-ink-soft">
                /
              </span>
            )}
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
