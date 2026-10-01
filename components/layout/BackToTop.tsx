import { ArrowUpIcon } from "@/components/ui/icons";

/** A round button that appears after scrolling and returns the visitor to the top of the page. */
export function BackToTop() {
  return (
    <a
      href="#top"
      aria-label="Back to top"
      className="back-to-top fixed right-4 bottom-[calc(1rem+var(--bottom-bar-height))] z-30 flex size-11 pressable items-center justify-center rounded-full bg-ink text-surface shadow-lg hover:bg-ink-raised sm:right-6"
    >
      <ArrowUpIcon />
    </a>
  );
}
