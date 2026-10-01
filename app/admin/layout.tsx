import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { default: `Admin | ${siteConfig.name}`, template: `%s | ${siteConfig.name} Admin` },
  robots: { index: false, follow: false },
};

/** Shared by the admin login and the signed-in admin panel in (panel). */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
