import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { getStoreTheme } from "@/lib/store-settings";
import { themeStyle } from "@/lib/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "shopping",
  // Phones would otherwise turn prices and order numbers into phone links.
  formatDetection: { telephone: false },
  // Proves the site belongs to you in Google Search Console; paste the code it gives you.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

/** The browser bar takes the brand colour of the theme the admin picked. */
export async function generateViewport(): Promise<Viewport> {
  const theme = await getStoreTheme();
  return { themeColor: theme.brand, width: "device-width", initialScale: 1 };
}

/**
 * The page shell shared by the shop and the admin area; each adds its own header and layout.
 * The admin's colour theme is set here, so every page and the admin follow it.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getStoreTheme();
  return (
    <html
      lang={siteConfig.locale}
      className={`${geistSans.variable} h-full antialiased`}
      style={themeStyle(theme) as React.CSSProperties}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
