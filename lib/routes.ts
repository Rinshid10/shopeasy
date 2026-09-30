export const routes = {
  home: "/",
  /** The "Shop by Category" section of the home page. */
  allCategories: "/#categories",
  search: "/search",
  category: (slug: string) => `/category/${slug}`,
  product: (slug: string) => `/product/${slug}`,
} as const;
