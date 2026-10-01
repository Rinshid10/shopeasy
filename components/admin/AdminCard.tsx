import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface AdminCardProps {
  title: string;
  description?: string;
  /** A "View all" style link in the corner. */
  action?: { label: string; href: string };
  className?: string;
  children: ReactNode;
}

/** A titled white panel, the building block of every admin screen. */
export function AdminCard({ title, description, action, className, children }: AdminCardProps) {
  return (
    <Card as="section" className={cn("flex min-w-0 flex-col gap-4 p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
        </div>
        {action && (
          <Link
            href={action.href}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            {action.label}
            <ArrowRightIcon className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </Card>
  );
}
