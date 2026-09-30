export const siteConfig = {
  name: "BuyEasy",
  tagline: "Smart picks from Flipkart, made easy",
  description:
    "BuyEasy handpicks value-for-money products on Flipkart across fashion, electronics, home and more, so you can compare quickly and buy with confidence.",
  // Set NEXT_PUBLIC_SITE_URL to the live domain. Netlify's own URL variable is the fallback,
  // so canonical URLs and the sitemap never point at localhost in production.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "http://localhost:3000",
  locale: "en-IN",
  currency: "INR",
  contactEmail: "hello@example.com", // TODO: replace with your contact email
  cuelinksVerification: "VERIFY-CL-AYD6F1BB",
  // The catalogue in data/ is sample data. While this is on, a note says so beside the
  // products. Set isEnabled to false once real Flipkart listings replace the samples.
  demoCatalogue: {
    isEnabled: true,
    note: "Demo catalogue: the products, prices, ratings and discounts shown are samples.",
  },
  affiliate: {
    buttonLabel: "Buy from Flipkart",
    linkLabel: "Affiliate link",
    linkRel: "sponsored nofollow noopener noreferrer",
    priceNote: "Price may change. Check latest price on Flipkart.",
    buttonsNote: "Buy buttons are affiliate links.",
    disclosure:
      "As a Flipkart affiliate, we may earn a commission from qualifying purchases. Prices and availability may change; check the latest price on Flipkart.",
  },
} as const;
