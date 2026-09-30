export const routes = {
  home: "/",
  search: "/search",
  category: (slug: string) => `/category/${slug}`,
  product: (slug: string) => `/product/${slug}`,
} as const;
