import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Checkout, orders, the wishlist and the account are personal to each visitor, search
    // results are endless, and the admin area is private, so search engines skip them all.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/checkout/",
        routes.orders,
        routes.account,
        routes.wishlist,
        routes.search,
        routes.admin.dashboard,
        "/api/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
