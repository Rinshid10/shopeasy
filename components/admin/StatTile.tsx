import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

interface StatTileProps {
  label: string;
  value: string;
  /** Percentage change against the previous period, or null when there is nothing to compare. */
  change?: number | null;
  /** What the change is measured against, e.g. "vs previous 7 days". */
  changeLabel?: string;
  /** Whether a rise is good news (revenue) or bad news (cancellations). */
  upIsGood?: boolean;
}

/** One headline number with its change against the previous period. */
export function StatTile({ label, value, change, changeLabel, upIsGood = true }: StatTileProps) {
  const hasChange = change !== undefined && change !== null;
  const isGood = hasChange && (change === 0 || change > 0 === upIsGood);

  return (
    <Card className="flex flex-col gap-1 p-4">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className="text-2xl font-extrabold tracking-tight text-ink sm:text-[1.75rem]">{value}</p>
      {hasChange ? (
        <p className="flex flex-wrap items-center gap-1.5 text-xs">
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 font-semibold",
              isGood ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative",
            )}
          >
            <span aria-hidden="true">{change > 0 ? "▲" : change < 0 ? "▼" : "■"}</span>{" "}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          {changeLabel && <span className="text-ink-muted">{changeLabel}</span>}
        </p>
      ) : (
        changeLabel && <p className="text-xs text-ink-muted">No earlier data to compare</p>
      )}
    </Card>
  );
}
