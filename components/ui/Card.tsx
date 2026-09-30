import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  as?: "div" | "article" | "section";
  className?: string;
  children: ReactNode;
}

export function Card({ as: Element = "div", className, children }: CardProps) {
  return (
    <Element className={cn("rounded-xl border border-line bg-surface", className)}>
      {children}
    </Element>
  );
}
