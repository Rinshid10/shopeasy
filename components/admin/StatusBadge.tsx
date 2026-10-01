import { cn } from "@/lib/cn";
import type { StatusDisplay, StatusTone } from "@/lib/admin/labels";

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  info: "bg-info-soft text-info",
  progress: "bg-tint-lavender text-violet-ink",
  good: "bg-positive-soft text-positive",
  warning: "bg-warning-soft text-warning",
  critical: "bg-negative-soft text-negative",
};

interface StatusBadgeProps {
  status: StatusDisplay;
}

/** A coloured pill with a dot and the status in words, so it never relies on colour alone. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-none font-semibold whitespace-nowrap",
        toneClasses[status.tone],
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status.label}
    </span>
  );
}
