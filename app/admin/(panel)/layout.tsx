import Link from "next/link";
import { AdminBrand } from "@/components/admin/AdminBrand";
import { AdminNavList } from "@/components/admin/AdminNavList";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { StoreIcon } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/admin/session";
import { routes } from "@/lib/routes";

/** The admin area: a sidebar on large screens, a bottom tab bar on phones, and a top bar. */
export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const { email } = await requireAdmin();

  return (
    <div className="flex min-h-dvh bg-surface-muted">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-surface p-4 lg:flex print:hidden">
        <AdminBrand />
        <nav aria-label="Admin">
          <AdminNavList />
        </nav>
        <p className="mt-auto truncate text-xs text-ink-muted" title={email}>
          Signed in as {email}
        </p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6 print:hidden">
          <div className="lg:hidden">
            <AdminBrand />
          </div>
          <Link
            href={routes.home}
            className="ml-auto flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            <StoreIcon className="size-5" />
            <span className="max-sm:sr-only">View store</span>
          </Link>
          <AdminSignOutButton initial={(email[0] ?? "A").toUpperCase()} email={email} />
        </header>
        <main
          id="main-content"
          className="flex-1 px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 lg:px-8 lg:pb-6"
        >
          {children}
        </main>
      </div>
      <AdminTabBar />
    </div>
  );
}
