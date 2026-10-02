import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/ui/icons";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /** A link back to the parent screen, e.g. from an order to the orders list. */
  back?: { label: string; href: string };
  /** Buttons shown on the right, e.g. "Add product". */
  actions?: ReactNode;
}

/** The title row at the top of every admin screen. */
export function AdminPageHeader({ title, description, back, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 self-start text-sm font-medium text-brand hover:underline"
          >
            <ChevronLeftIcon className="size-4" />
            {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description && <p className="text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
