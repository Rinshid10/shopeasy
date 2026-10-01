import { ViewTransition, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Wrap a page's content in this so it fades out when the visitor leaves and fades in,
 * rising slightly, when they arrive. Browsers without view transitions just swap pages.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
