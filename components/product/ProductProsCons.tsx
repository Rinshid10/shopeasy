import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
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
    <Card className="p-4">
      <h3 className="font-semibold text-ink">{title}</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-ink sm:text-base">
            {icon}
            {point}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ProductProsCons({ pros, cons }: ProductProsConsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PointList
        title="Pros"
        points={pros}
        icon={<CheckIcon className="mt-0.5 size-5 shrink-0 text-positive" />}
      />
      <PointList
        title="Cons"
        points={cons}
        icon={<CloseIcon className="mt-0.5 size-5 shrink-0 text-negative" />}
      />
    </div>
  );
}
