import { CategoryTiles } from "@/components/category/CategoryTiles";
import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategories } from "@/lib/categories";
import { getTopPicks } from "@/lib/products";

const TOP_PICKS_ID = "top-picks";

export default async function HomePage() {
  const [categories, topPicks] = await Promise.all([getCategories(), getTopPicks()]);

  return (
    <>
      <Hero topPicksId={TOP_PICKS_ID} />
      <Container className="flex flex-col gap-10 py-8 sm:gap-12 sm:py-10">
        <section aria-labelledby="categories-heading">
          <SectionHeading id="categories-heading" title="Shop by category" />
          <CategoryTiles categories={categories} />
        </section>
        <section id={TOP_PICKS_ID} aria-labelledby="top-picks-heading" className="scroll-mt-20">
          <SectionHeading
            id="top-picks-heading"
            title="Top picks"
            description="Our favourite value-for-money finds right now."
          />
          <ProductGrid products={topPicks} />
        </section>
      </Container>
    </>
  );
}
