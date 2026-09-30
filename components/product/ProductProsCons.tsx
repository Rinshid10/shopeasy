import type { ReactNode } from "react";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

interface ProductProsConsProps {
  pros: string[];
  cons: string[];
}

interface PointListProps {
  title: string;
  points: string[];
  icon: ReactNode;
}

function PointList({ title, points, icon }: PointListProps) {
  return (
    <div className="rounded-2xl bg-surface-muted p-4 sm:p-5">
      <h3 className="font-bold text-ink">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-ink sm:text-base">
            {icon}
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductProsCons({ pros, cons }: ProductProsConsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PointList
        title="What we like"
        points={pros}
        icon={<CheckIcon className="mt-0.5 size-5 shrink-0 text-ink" />}
      />
      <PointList
        title="What to keep in mind"
        points={cons}
        icon={<CloseIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />}
      />
    </div>
  );
}
