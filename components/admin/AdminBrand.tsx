import Link from "next/link";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

/** The store logo with an "Admin" tag, linking to the dashboard. */
export function AdminBrand() {
  return (
    <Link href={routes.admin.dashboard} className="flex items-center gap-2.5 rounded-lg">
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-xl bg-brand text-lg font-black text-surface"
      >
        {siteConfig.name.charAt(0)}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-extrabold tracking-tight text-ink">{siteConfig.name}</span>
        <span className="text-[11px] font-semibold tracking-widest text-brand uppercase">
          Admin
        </span>
      </span>
    </Link>
  );
}
