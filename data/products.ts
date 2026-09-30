import type { Product } from "@/types";

// Sample catalogue. Prices are indicative and the write-ups are sample copy:
// verify every detail against the live Flipkart listing before publishing.
// Search this file for "TODO: replace with affiliate link" to find every placeholder link.

export const products: Product[] = [
  {
    slug: "boat-bassheads-100-wired-earphones",
    title: "boAt Bassheads 100 Wired Earphones with Mic",
    brand: "boAt",
    categorySlug: "earphones-headphones",
    shortDescription: "Budget wired earphones with punchy bass and an in-line mic.",
    description:
      "A no-fuss pair of wired earphones for everyday listening. The 3.5 mm jack works with most phones and laptops, the in-line mic handles calls, and the bass-forward sound suits Bollywood and pop playlists.",
    price: 399,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Very affordable", "Strong bass for the price", "In-line mic for calls"],
    cons: ["No volume buttons", "Cable can tangle in a pocket"],
    isTopPick: true,
  },
  {
    slug: "boat-rockerz-255-pro-plus-neckband",
    title: "boAt Rockerz 255 Pro+ Bluetooth Neckband",
    brand: "boAt",
    categorySlug: "earphones-headphones",
    shortDescription: "Popular neckband with long battery life and fast charging.",
    description:
      "One of the best-known neckbands under ₹1,000. It is built for long listening sessions, tops up quickly over USB Type-C, and is rated for sweat and splash resistance, which makes it a solid pick for commutes and workouts.",
    price: 999,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Long battery life", "Quick top-up charging", "Sweat and splash resistant"],
    cons: ["Bass-heavy sound is not for everyone", "Neckband style feels bulky to some"],
    isTopPick: true,
  },
  {
    slug: "boat-airdopes-141-tws-earbuds",
    title: "boAt Airdopes 141 True Wireless Earbuds",
    brand: "boAt",
    categorySlug: "earphones-headphones",
    shortDescription: "Entry-level true wireless earbuds with a compact charging case.",
    description:
      "An easy first step into true wireless audio. The earbuds pair as soon as you open the case, offer a low-latency mode for videos and casual gaming, and the case carries several extra charges.",
    price: 1199,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Compact charging case", "Low-latency mode", "Touch controls"],
    cons: ["No active noise cancellation", "Average call quality in noisy places"],
    isTopPick: false,
  },
  {
    slug: "portronics-konnect-l-type-c-cable",
    title: "Portronics Konnect L Braided Type-C Cable (1.2 m)",
    brand: "Portronics",
    categorySlug: "chargers-cables",
    shortDescription: "Nylon-braided Type-C cable for everyday fast charging.",
    description:
      "A sturdy replacement for the cable that came in the box. The nylon braiding resists fraying, the 1.2 m length reaches from a wall socket to a bedside table, and it supports fast charging and data transfer.",
    price: 129,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Durable braided build", "Supports fast charging", "Very low price"],
    cons: ["Fastest proprietary charging speeds need the brand's own cable"],
    isTopPick: true,
  },
  {
    slug: "samsung-25w-type-c-travel-adapter",
    title: "Samsung 25W USB Type-C Travel Adapter",
    brand: "Samsung",
    categorySlug: "chargers-cables",
    shortDescription: "Original Samsung 25W fast charger for Galaxy phones.",
    description:
      "The safe choice if your Galaxy phone shipped without a charger. It delivers Samsung's 25W Super Fast Charging on supported models and works as a standard USB Power Delivery charger for other Type-C devices.",
    price: 1099,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: [
      "Original Samsung accessory",
      "Compact and travel-friendly",
      "Works with USB PD devices",
    ],
    cons: ["Cable is often sold separately", "Costlier than third-party chargers"],
    isTopPick: true,
  },
  {
    slug: "boat-dual-port-rapid-car-charger",
    title: "boAt Dual Port Rapid Car Charger",
    brand: "boAt",
    categorySlug: "chargers-cables",
    shortDescription: "Dual-port car charger with Quick Charge support.",
    description:
      "Charge two phones from your car's 12V socket. One port supports Quick Charge for compatible phones, the other handles a second device, and the compact body sits flush in most dashboards.",
    price: 449,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Charges two devices at once", "Quick Charge support", "Compact design"],
    cons: ["No USB Type-C port", "Fast charging needs a compatible phone"],
    isTopPick: false,
  },
  {
    slug: "mi-power-bank-3i-10000mah",
    title: "Mi Power Bank 3i 10000 mAh (18W Fast Charging)",
    brand: "Xiaomi",
    categorySlug: "power-banks",
    shortDescription: "Slim 10000 mAh power bank with 18W fast charging.",
    description:
      "A dependable everyday power bank that slips into a bag or a large pocket. It charges two devices at once, supports 18W fast charging, and can be recharged through either Micro-USB or Type-C.",
    price: 1099,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Slim metal body", "18W fast charging", "Micro-USB and Type-C input"],
    cons: ["Charging cable in the box is short", "Takes a few hours to refill"],
    isTopPick: true,
  },
  {
    slug: "xiaomi-power-bank-4i-20000mah",
    title: "Xiaomi Power Bank 4i 20000 mAh (33W Fast Charging)",
    brand: "Xiaomi",
    categorySlug: "power-banks",
    shortDescription: "High-capacity power bank for travel, with 33W fast charging.",
    description:
      "Built for long trips and power cuts. The 20000 mAh capacity is enough for several phone charges, three output ports cover the whole family, and 33W output charges supported phones quickly.",
    price: 1999,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Several phone charges per refill", "33W fast charging", "Three output ports"],
    cons: ["Heavy to carry every day", "Slow to refill without a fast charger"],
    isTopPick: true,
  },
  {
    slug: "ambrane-stylo-10k-power-bank",
    title: "Ambrane Stylo 10K 10000 mAh Power Bank (20W)",
    brand: "Ambrane",
    categorySlug: "power-banks",
    shortDescription: "Affordable slim power bank with Type-C fast charging.",
    description:
      "A budget-friendly alternative to the bigger brands. It offers 20W fast charging, a Type-C port that works for both input and output, and a slim body that is easy to carry.",
    price: 899,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Good value", "Type-C input and output", "Slim and light"],
    cons: ["Glossy finish picks up scratches", "Gets warm during fast charging"],
    isTopPick: false,
  },
  {
    slug: "spigen-rugged-armor-case-iphone-15",
    title: "Spigen Rugged Armor Back Cover for iPhone 15",
    brand: "Spigen",
    categorySlug: "cases-stands",
    shortDescription: "Slim, shock-absorbing matte black case for the iPhone 15.",
    description:
      "A flexible TPU case that adds grip and drop protection without much bulk. Raised edges protect the screen and camera, and the matte finish resists fingerprints.",
    price: 899,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Good drop protection", "Slim and grippy", "Raised edges for screen and camera"],
    cons: ["Only fits the iPhone 15", "Costlier than generic covers"],
    isTopPick: true,
  },
  {
    slug: "striff-adjustable-mobile-stand",
    title: "STRIFF Adjustable Mobile Phone Stand",
    brand: "STRIFF",
    categorySlug: "cases-stands",
    shortDescription: "Foldable desk stand with multiple viewing angles.",
    description:
      "A simple desk stand for video calls, recipes and online classes. It folds flat for travel, adjusts to several viewing angles, and holds most phones and small tablets.",
    price: 129,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Very affordable", "Folds flat", "Works with phones and small tablets"],
    cons: ["Plastic build", "Not tall enough for eye-level video calls"],
    isTopPick: true,
  },
  {
    slug: "portronics-clamp-x-car-mobile-holder",
    title: "Portronics Clamp X Car-Vent Mobile Holder",
    brand: "Portronics",
    categorySlug: "cases-stands",
    shortDescription: "Air-vent phone holder with an adjustable clamp for navigation.",
    description:
      "Keeps your phone at eye level for maps while you drive. The holder clips onto the air vent, the clamp adjusts to fit most phones, and the head rotates between portrait and landscape.",
    price: 349,
    priceCheckedOn: "2026-09-30",
    imageUrl: null,
    affiliateUrl: "https://www.flipkart.com/", // TODO: replace with affiliate link
    pros: ["Easy to install", "Rotates for portrait or landscape", "Fits most phones"],
    cons: ["Blocks one air vent", "May not suit round or vertical vents"],
    isTopPick: false,
  },
];
