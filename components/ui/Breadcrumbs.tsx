import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";
import type { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {index > 0 && <ChevronRightIcon className="size-4 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="py-1 hover:text-brand hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="py-1 font-medium text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
