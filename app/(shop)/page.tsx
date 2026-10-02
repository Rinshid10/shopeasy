import { CategoryTiles } from "@/components/category/CategoryTiles";
import { Hero } from "@/components/home/Hero";
import { OfferBanners } from "@/components/home/OfferBanners";
import { PRICE_TILE_LIMITS, PriceTiles } from "@/components/home/PriceTiles";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategories } from "@/lib/categories";
import { getDiscountPercent } from "@/lib/format";
import { countProductsUnder, getBiggestDiscounts, getTopPicks } from "@/lib/products";
import { routes } from "@/lib/routes";
import { buildPageMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const CATEGORIES_ID = "categories";
const DEALS_ID = "deals";
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
  const [categories, topPicks, deals, priceCounts] = await Promise.all([
    getCategories(),
    getTopPicks(),
    getBiggestDiscounts(),
    countProductsUnder(PRICE_TILE_LIMITS),
  ]);
  const topDeal = deals[0];
  const maxDiscountPercent = topDeal ? (getDiscountPercent(topDeal.price, topDeal.mrp) ?? 0) : 0;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Hero topPicksId={TOP_PICKS_ID} />
      <Container className="flex flex-col gap-10 py-8 sm:gap-14 sm:py-10">
        <section
          id={CATEGORIES_ID}
          aria-labelledby="categories-heading"
          className={`${SECTION_SCROLL_MARGIN}`}
        >
          <SectionHeading
            id="categories-heading"
            title="Shop by Category"
            description="Explore top categories and find exactly what you need."
          />
          <CategoryTiles categories={categories} />
        </section>

        {maxDiscountPercent > 0 && (
          <section aria-labelledby="offers-heading" className="">
            <h2 id="offers-heading" className="sr-only">
              Offers
            </h2>
            <OfferBanners
              maxDiscountPercent={maxDiscountPercent}
              dealsHref={`#${DEALS_ID}`}
              shopHref={`#${CATEGORIES_ID}`}
            />
          </section>
        )}

        {deals.length > 0 && (
          <section
            id={DEALS_ID}
            aria-labelledby="deals-heading"
            className={`${SECTION_SCROLL_MARGIN}`}
          >
            <SectionHeading
              id="deals-heading"
              title="Biggest discounts"
              description="The best savings off MRP right now."
              action={{ label: "View all", href: routes.search }}
            />
            {/* These products also appear under Top picks, so only that grid's pictures glide. */}
            <ProductCarousel products={deals} label="Biggest discounts" />
          </section>
        )}

        <section aria-labelledby="price-heading" className="">
          <SectionHeading
            id="price-heading"
            title="Shop by price"
            description="Great finds for every budget."
          />
          <PriceTiles counts={priceCounts} />
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
    </>
  );
}
