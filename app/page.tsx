import { CategoryTiles } from "@/components/category/CategoryTiles";
import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { PageTransition } from "@/components/ui/PageTransition";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategories } from "@/lib/categories";
import { getTopPicks } from "@/lib/products";
import { routes } from "@/lib/routes";
import { buildPageMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const CATEGORIES_ID = "categories";
const TOP_PICKS_ID = "top-picks";
/** Keeps a section's heading clear of the sticky header when it is scrolled to. */
const SECTION_SCROLL_MARGIN = "scroll-mt-20 lg:scroll-mt-36";

export const metadata = buildPageMetadata({
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  absoluteTitle: true,
  description: siteConfig.description,
  path: routes.home,
});

export default async function HomePage() {
  const [categories, topPicks] = await Promise.all([getCategories(), getTopPicks()]);

  return (
    <PageTransition>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Hero topPicksId={TOP_PICKS_ID} />
      <Container className="flex flex-col gap-10 py-8 sm:gap-12 sm:py-10">
        <section
          id={CATEGORIES_ID}
          aria-labelledby="categories-heading"
          className={`reveal ${SECTION_SCROLL_MARGIN}`}
        >
          <SectionHeading
            id="categories-heading"
            title="Shop by Category"
            description="Explore top categories and find exactly what you need."
          />
          <CategoryTiles categories={categories} />
        </section>
        <section
          id={TOP_PICKS_ID}
          aria-labelledby="top-picks-heading"
          className={SECTION_SCROLL_MARGIN}
        >
          <SectionHeading
            id="top-picks-heading"
            title="Top picks for you"
            action={{ label: "View all", href: routes.search }}
          />
          <ProductGrid products={topPicks} />
        </section>
      </Container>
    </PageTransition>
  );
}
