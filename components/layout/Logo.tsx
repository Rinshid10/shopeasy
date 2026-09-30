import Link from "next/link";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

export function Logo() {
  return (
    <Link
      href={routes.home}
      aria-label={`${siteConfig.name} home`}
      className="rounded text-xl font-extrabold tracking-tight text-brand"
    >
      {siteConfig.name}
    </Link>
  );
}
