import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerWidth = "wide" | "narrow";

interface ContainerProps {
  /** "wide" is for browsing pages with product grids; "narrow" keeps reading pages comfortable. */
  width?: ContainerWidth;
  className?: string;
  children: ReactNode;
}

const widthClasses: Record<ContainerWidth, string> = {
  wide: "max-w-[105rem] lg:px-10",
  narrow: "max-w-6xl",
};

export function Container({ width = "wide", className, children }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6", widthClasses[width], className)}>
      {children}
    </div>
  );
}
