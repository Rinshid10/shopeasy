import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  as?: "div" | "article" | "section" | "nav";
  id?: string;
  className?: string;
  /** The id of the card's heading, so a section is announced by its title. */
  "aria-labelledby"?: string;
  "aria-label"?: string;
  children: ReactNode;
}

export function Card({ as: Element = "div", className, children, ...attributes }: CardProps) {
  return (
    <Element className={cn("rounded-2xl raised", className)} {...attributes}>
      {children}
    </Element>
  );
}
