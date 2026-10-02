import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Checkout and orders are personal to each visitor, and the admin area is
    // private, so search engines skip them all.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout/", routes.orders, routes.account, routes.admin.dashboard],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
