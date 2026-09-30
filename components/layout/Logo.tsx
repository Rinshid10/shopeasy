import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

interface LogoProps {
  /** Set when the logo sits on a navy background, such as the footer. */
  onDark?: boolean;
}

export function Logo({ onDark = false }: LogoProps) {
  return (
    <Link
      href={routes.home}
      aria-label={`${siteConfig.name} home`}
      className="flex items-center gap-2.5 rounded-lg"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-brand text-lg font-black text-surface md:size-10 md:rounded-xl md:text-2xl"
      >
        {siteConfig.name.charAt(0)}
      </span>
      <span
        className={cn(
          "text-xl font-extrabold tracking-tight md:text-2xl",
          onDark ? "text-surface" : "text-ink",
        )}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
