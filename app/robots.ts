import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // The cart, checkout and orders are personal to each visitor, so search engines skip them.
    rules: { userAgent: "*", allow: "/", disallow: [routes.cart, "/checkout/", routes.orders] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
