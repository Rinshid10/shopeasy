"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronRightIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { NavLink } from "@/types";

interface MobileNavProps {
  links: NavLink[];
}

/** The hamburger menu: a panel that slides down under the header over a dimmed page. */
export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    }

    // Stop the page behind the menu from scrolling while it is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={() => setIsOpen((open) => !open)}
        className="flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-muted"
      >
        {isOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
      </button>
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-x-0 top-14 bottom-0 bg-ink/40 md:top-[4.5rem]",
          isOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      />
      <nav
        id={panelId}
        aria-label="Mobile"
        className={cn(
          "absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] overflow-y-auto rounded-b-3xl border-t border-line bg-surface shadow-xl",
          isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0",
        )}
      >
        <ul className="px-4 py-2 sm:px-6">
          {links.map((link) => (
            <li key={link.href} className="border-b border-line last:border-b-0">
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-3.5 font-medium text-ink hover:text-brand"
              >
                {link.label}
                <ChevronRightIcon className="size-4 text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
