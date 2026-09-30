import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getCategories } from "@/lib/categories";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

export async function Footer() {
  const categories = await getCategories();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-line bg-surface-muted">
      <Container className="flex flex-col gap-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-lg font-extrabold text-brand">{siteConfig.name}</p>
            <p className="mt-1 text-sm text-ink-muted">{siteConfig.tagline}</p>
          </div>
          <nav aria-labelledby="footer-categories-heading">
            <h2 id="footer-categories-heading" className="text-sm font-semibold text-ink">
              Categories
            </h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-4">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={routes.category(category.slug)}
                    className="inline-block py-1.5 text-sm text-ink-muted hover:text-brand hover:underline"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="border-t border-line pt-6 text-sm text-ink-muted">
          {siteConfig.affiliate.disclosure}
        </p>
        <p className="text-xs text-ink-muted">
          © {currentYear} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
