import type { ReactNode } from "react";
import { CashIcon, CubeIcon, TagIcon, TruckIcon } from "@/components/ui/icons";

interface TrustPoint {
  title: string;
  text: string;
  icon: ReactNode;
}

const TRUST_POINTS: TrustPoint[] = [
  {
    title: "Wide Range of Products",
    text: "From daily essentials to premium brands",
    icon: <CubeIcon className="size-6" />,
  },
  {
    title: "Low Prices",
    text: "Great value on every order",
    icon: <TagIcon className="size-6" />,
  },
  {
    title: "Cash on Delivery",
    text: "Pay when your order arrives",
    icon: <CashIcon className="size-6" />,
  },
  {
    title: "Free Delivery",
    text: "No delivery charge on any order",
    icon: <TruckIcon className="size-6" />,
  },
];

/**
 * Short reassurances. A row of tiles under the hero on most screens, and a stacked
 * panel beside it on very wide ones.
 */
export function TrustPoints() {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-4 px-1 lg:grid-cols-4 2xl:flex 2xl:flex-col 2xl:justify-center 2xl:gap-0 2xl:divide-y 2xl:divide-line 2xl:px-7">
      {TRUST_POINTS.map((point) => (
        <li key={point.title} className="flex items-center gap-3 2xl:py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand sm:size-12 2xl:bg-surface">
            {point.icon}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm leading-tight font-semibold text-ink">{point.title}</span>
            <span className="text-xs text-ink-muted max-sm:hidden sm:text-sm">{point.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
