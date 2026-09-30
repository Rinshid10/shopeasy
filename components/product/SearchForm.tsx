import Form from "next/form";
import { useId } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { SEARCH_QUERY_PARAM } from "@/lib/product-search";
import { routes } from "@/lib/routes";

/** Submits to the search page, which filters products by the query in the URL. */
export function SearchForm() {
  const inputId = useId();

  return (
    <Form action={routes.search} role="search" className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <input
        id={inputId}
        type="search"
        name={SEARCH_QUERY_PARAM}
        placeholder="Search for products, brands and more..."
        autoComplete="off"
        className="h-11 w-full rounded-full bg-surface-muted pr-4 pl-12 text-base text-ink placeholder:text-ink-muted md:h-12 md:text-sm"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute top-1 left-1.5 flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink md:top-1.5"
      >
        <SearchIcon />
      </button>
    </Form>
  );
}
