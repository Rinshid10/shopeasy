import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getStoreTheme } from "@/lib/store-settings";

/** Lets phones add the shop to the home screen like an app, in the admin's chosen colours. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const theme = await getStoreTheme();
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: theme.brand,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
