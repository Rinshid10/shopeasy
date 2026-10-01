"use client";

import { useId } from "react";
import { SearchIcon } from "@/components/ui/icons";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Read out to screen readers and shown as the placeholder. */
  label: string;
}

/** The search box above admin lists; filters the list as the owner types. */
export function SearchInput({ value, onChange, label }: SearchInputProps) {
  const id = useId();

  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted" />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={label}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-line bg-surface pr-3 pl-10 text-base text-ink transition-colors placeholder:text-ink-muted focus:border-brand sm:text-sm"
      />
    </div>
  );
}
