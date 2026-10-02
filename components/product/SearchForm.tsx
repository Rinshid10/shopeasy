"use client";

import Form from "next/form";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, type FormEvent } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { SEARCH_QUERY_PARAM } from "@/lib/product-search";
import { routes } from "@/lib/routes";

function getQueryFromUrl(): string {
  return new URLSearchParams(window.location.search).get(SEARCH_QUERY_PARAM) ?? "";
}

/**
 * The search box. From any page, submitting it opens the search page. On the search page
 * itself, results update live with every keystroke.
 */
export function SearchForm() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isOnSearchPage = usePathname() === routes.search;

  // When the search page is opened from a link or reload, show its query in the box.
  useEffect(() => {
    if (isOnSearchPage && inputRef.current) {
      inputRef.current.value = getQueryFromUrl();
    }
  }, [isOnSearchPage]);

  function updateResultsLive(event: FormEvent<HTMLInputElement>) {
    if (!isOnSearchPage) {
      return;
    }

    const query = event.currentTarget.value.trim();
    const params = new URLSearchParams(query ? { [SEARCH_QUERY_PARAM]: query } : undefined);
    const url = params.size > 0 ? `${routes.search}?${params}` : routes.search;
    // Updating the address this way makes the results re-filter at once, with no page load.
    window.history.replaceState(null, "", url);
  }

  return (
    <Form action={routes.search} role="search" className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        name={SEARCH_QUERY_PARAM}
        placeholder="Search for products, brands and more..."
        autoComplete="off"
        onInput={updateResultsLive}
        className="h-11 w-full rounded-full border border-transparent bg-surface-muted pr-4 pl-12 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:bg-surface md:h-12 md:text-sm"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute top-1 left-1.5 flex size-9 items-center justify-center rounded-full text-ink-muted hover:text-ink md:top-1.5"
      >
        <SearchIcon />
      </button>
    </Form>
  );
}
