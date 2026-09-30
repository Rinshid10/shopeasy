import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { getCategories } from "@/lib/categories";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

export async function Footer() {
  const categories = await getCategories();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 bg-ink text-ink-soft dark-section sm:mt-16">
      <Container className="flex flex-col gap-8 py-10">
        <div className="grid gap-8 md:grid-cols-6">
          <div className="flex flex-col items-start gap-3 md:col-span-2">
            <Logo onDark />
            <p className="max-w-sm text-sm">{siteConfig.description}</p>
          </div>
          <nav aria-labelledby="footer-categories-heading" className="md:col-span-2">
            <h2 id="footer-categories-heading" className="text-sm font-semibold text-surface">
              Categories
            </h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-6">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={routes.category(category.slug)}
                    className="inline-block rounded py-1.5 text-sm transition-colors hover:text-surface"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="rounded-2xl border border-ink-line bg-ink-raised p-4 md:col-span-2 md:self-start">
            <h2 className="text-sm font-semibold text-surface">Affiliate disclosure</h2>
            <p className="mt-2 text-sm">{siteConfig.affiliate.disclosure}</p>
          </div>
        </div>
        <p className="border-t border-ink-line pt-6 text-xs">
          © {currentYear} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
