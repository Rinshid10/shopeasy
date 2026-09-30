import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { NavLink } from "@/types";

interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
  /** An optional link shown beside the title, e.g. "View all". */
  action?: NavLink;
}

export function SectionHeading({ id, title, description, action }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
      <div>
        <h2 id={id} className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-ink-muted max-sm:hidden sm:text-base">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex shrink-0 items-center gap-1 rounded-lg py-1 text-sm font-semibold text-brand hover:text-brand-strong hover:underline"
        >
          {action.label}
          <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </div>
  );
}
