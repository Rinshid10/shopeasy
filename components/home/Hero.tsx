import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

interface HeroProps {
  /** The id of the section the main button scrolls to. */
  topPicksId: string;
}

export function Hero({ topPicksId }: HeroProps) {
  return (
    <section className="border-b border-line bg-brand-soft">
      <Container className="flex flex-col items-start gap-4 py-10 sm:py-14">
        <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {siteConfig.tagline}
        </h1>
        <p className="max-w-xl text-base text-ink-muted sm:text-lg">{siteConfig.description}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`#${topPicksId}`} size="lg">
            See top picks
          </ButtonLink>
          <ButtonLink href={routes.search} variant="outline" size="lg">
            Search products
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
