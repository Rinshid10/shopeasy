import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  as?: "div" | "article" | "section";
  className?: string;
  /** The id of the card's heading, so a section is announced by its title. */
  "aria-labelledby"?: string;
  children: ReactNode;
}

export function Card({ as: Element = "div", className, children, ...aria }: CardProps) {
  return (
    <Element className={cn("rounded-2xl border border-line bg-surface", className)} {...aria}>
      {children}
    </Element>
  );
}
