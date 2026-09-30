export const siteConfig = {
  name: "BuyEasy",
  tagline: "Smart picks from Flipkart, made easy",
  description:
    "BuyEasy handpicks value-for-money mobile accessories and gadgets on Flipkart, so you can compare quickly and buy with confidence.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en-IN",
  currency: "INR",
  contactEmail: "hello@example.com", // TODO: replace with your contact email
  affiliate: {
    buttonLabel: "Check price on Flipkart",
    linkLabel: "Affiliate link",
    linkRel: "sponsored nofollow noopener noreferrer",
    priceNote: "Price may change. Check latest price on Flipkart.",
    disclosure:
      "As a Flipkart affiliate, we may earn a commission from qualifying purchases. Prices and availability may change; check the latest price on Flipkart.",
  },
} as const;
