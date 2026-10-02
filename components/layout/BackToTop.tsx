"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@/components/ui/icons";

/** A round button that appears after about a screen of scrolling and returns to the top. */
export function BackToTop() {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    function update() {
      setIsShown(window.scrollY > window.innerHeight * 0.7);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!isShown) {
    return null;
  }

  return (
    <a
      href="#top"
      aria-label="Back to top"
      className="fixed right-4 bottom-[calc(1rem+var(--bottom-bar-height))] z-30 flex size-11 items-center justify-center rounded-full bg-ink text-surface shadow-lg hover:bg-ink-raised sm:right-6"
    >
      <ArrowUpIcon />
    </a>
  );
}
