"use client";

import { useEffect, useRef, useState } from "react";
import { AdminBrand } from "@/components/admin/AdminBrand";
import { AdminNavList } from "@/components/admin/AdminNavList";
import { CloseIcon, MoreIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** The phone tab bar's "More" tab: opens a panel with every admin section over a dimmed screen. */
export function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

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
        aria-controls="admin-mobile-menu"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold",
          isOpen ? "text-brand" : "text-ink-muted",
        )}
      >
        <MoreIcon className="size-6" />
        More
      </button>
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-ink/40",
          isOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      />
      <nav
        id="admin-mobile-menu"
        aria-label="Admin"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-6 overflow-y-auto bg-surface p-4 shadow-2xl",
          isOpen ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <AdminBrand />
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setIsOpen(false)}
            className="flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-muted"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>
        <AdminNavList onNavigate={() => setIsOpen(false)} />
      </nav>
    </>
  );
}
