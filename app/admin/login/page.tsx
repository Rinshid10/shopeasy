import { AdminBrand } from "@/components/admin/AdminBrand";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  // Only return to a page inside the admin, never to another site.
  const returnTo = typeof next === "string" && next.startsWith("/admin") ? next : "/admin";

  return (
    <main
      id="main-content"
      className="flex min-h-dvh items-center justify-center bg-surface-muted px-4 py-10"
    >
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <AdminBrand />
        <div>
          <h1 className="text-xl font-extrabold text-ink">Sign in to the admin</h1>
          <p className="mt-1 text-sm text-ink-muted">Use your admin email and password.</p>
        </div>
        <AdminLoginForm returnTo={returnTo} />
      </div>
    </main>
  );
}
