import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { DailySales } from "@/lib/admin/stats";

const TICK_COUNT = 4;

/** Rounds up to a clean axis maximum: 1, 2, 2.5 or 5 times a power of ten. */
function niceMax(value: number): number {
  if (value <= 0) {
    return 1000;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10;
  return step * magnitude;
}

const dayLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const fullDayLabel = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const compactRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
  trailingZeroDisplay: "stripIfInteger",
});

interface SalesChartProps {
  days: DailySales[];
}

/**
 * Daily revenue as columns. Each column shows its day's figures on hover or keyboard focus,
 * the best day is labelled, and the same numbers are available as a table.
 */
export function SalesChart({ days }: SalesChartProps) {
  const max = niceMax(Math.max(...days.map((day) => day.revenue)));
  const best = days.reduce((top, day) => (day.revenue > top.revenue ? day : top), days[0]);
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, index) => (max / TICK_COUNT) * index);

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative flex h-56 gap-2 pl-12 sm:h-64">
        {/* Y axis: clean values with hairline gridlines behind the columns. */}
        {/* Matches the column area exactly (above the 1.5rem date row), so ticks line up with bars. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 bottom-6">
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-0 flex translate-y-1/2 items-center gap-2"
              style={{ bottom: `${(tick / max) * 100}%` }}
            >
              <span className="w-10 text-right text-[11px] text-ink-muted tabular-nums">
                {compactRupees.format(tick)}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          ))}
        </div>
        <ol className="relative flex flex-1 items-end justify-between gap-1 pb-6">
          {days.map((day, index) => {
            const height = (day.revenue / max) * 100;
            const isBest = day === best && day.revenue > 0;
            const date = new Date(`${day.date}T12:00:00+05:30`);
            return (
              <li
                key={day.date}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
              >
                <button
                  type="button"
                  aria-label={`${fullDayLabel.format(date)}: ${formatPrice(day.revenue)} from ${day.orderCount} ${day.orderCount === 1 ? "order" : "orders"}`}
                  className="flex h-full w-full cursor-default flex-col items-center justify-end rounded-md focus-visible:outline-offset-0"
                >
                  {isBest && (
                    <span className="mb-1 text-[11px] font-semibold text-ink tabular-nums">
                      {compactRupees.format(day.revenue)}
                    </span>
                  )}
                  <span
                    className={cn(
                      "w-full max-w-6 rounded-t bg-brand transition-[filter] duration-150 group-focus-within:brightness-125 group-hover:brightness-125",
                      day.revenue === 0 && "bg-line",
                    )}
                    style={{ height: `max(${height}%, 2px)` }}
                  />
                </button>
                {/* Tooltip: value first, then the day and order count. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none invisible absolute bottom-full z-10 mb-1 flex flex-col items-center rounded-lg bg-ink px-2.5 py-1.5 text-center whitespace-nowrap text-surface opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100",
                    index < 2
                      ? "left-0"
                      : index > days.length - 3
                        ? "right-0"
                        : "left-1/2 -translate-x-1/2",
                  )}
                >
                  <span className="text-sm font-bold tabular-nums">{formatPrice(day.revenue)}</span>
                  <span className="text-[11px] text-ink-soft">
                    {fullDayLabel.format(date)} · {day.orderCount}{" "}
                    {day.orderCount === 1 ? "order" : "orders"}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-full mt-1.5 text-[10px] whitespace-nowrap text-ink-muted sm:text-[11px]",
                    // Counting back from today, every 4th day is labelled on phones and every
                    // 2nd on wider screens, so the dates never run into each other.
                    (days.length - 1 - index) % 4 !== 0 && "max-sm:invisible",
                    (days.length - 1 - index) % 2 !== 0 && "invisible",
                  )}
                >
                  {dayLabel.format(date)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-brand">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead className="text-xs text-ink-muted">
            <tr>
              <th className="py-1 font-medium">Day</th>
              <th className="py-1 text-right font-medium">Orders</th>
              <th className="py-1 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {days.map((day) => (
              <tr key={day.date}>
                <td className="py-1.5">
                  {fullDayLabel.format(new Date(`${day.date}T12:00:00+05:30`))}
                </td>
                <td className="py-1.5 text-right tabular-nums">{day.orderCount}</td>
                <td className="py-1.5 text-right tabular-nums">{formatPrice(day.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
