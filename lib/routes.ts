export const routes = {
  home: "/",
  /** The "Shop by Category" section of the home page. */
  allCategories: "/#categories",
  search: "/search",
  category: (slug: string) => `/category/${slug}`,
  product: (slug: string) => `/product/${slug}`,
  cart: "/cart",
  checkoutAddress: "/checkout/address",
  checkoutPayment: "/checkout/payment",
  checkoutSummary: "/checkout/summary",
  orderSuccess: "/checkout/success",
  orders: "/orders",
  orderDetails: (orderId: string) => `/orders/details?id=${encodeURIComponent(orderId)}`,
} as const;
