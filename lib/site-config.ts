export const siteConfig = {
  name: "ShopEasy",
  tagline: "Everything you need, at prices you'll love",
  description:
    "ShopEasy brings you fashion, home, beauty, electronics and more at low prices, with free delivery and cash on delivery.",
  // Set NEXT_PUBLIC_SITE_URL to the live domain. Netlify's own URL variable is the fallback,
  // so canonical URLs and the sitemap never point at localhost in production.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "http://localhost:3000",
  locale: "en-IN",
  currency: "INR",
  contactEmail: "hello@example.com", // TODO: replace with your contact email
  store: {
    /** Delivery charge per order, in rupees. 0 shows "FREE". */
    deliveryCharge: 0,
    /** The most of one product a customer can order at once. */
    maxQuantityPerItem: 10,
    /** Shown as the delivery estimate: this many days after the order is placed. */
    deliveryDays: { min: 4, max: 7 },
  },
  // The catalogue in data/ and the checkout are a demo: orders are kept only in the
  // visitor's browser. While this is on, notes say so. Set isEnabled to false once real
  // products and an order backend are connected.
  demoStore: {
    isEnabled: true,
    catalogueNote: "Demo store: the products, prices, ratings and discounts shown are samples.",
    orderNote:
      "Demo store: this order is saved only in this browser. No real order is placed or delivered.",
  },
} as const;
