import Image from "next/image";
import { TrustPoints } from "@/components/home/TrustPoints";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";

const HERO_PHOTO = {
  src: "/images/demo/hero.jpg",
  alt: "A sofa, fridge, washing machine, sneakers, a handbag, headphones and a phone",
  width: 1234,
  height: 650,
};

interface HeroProps {
  /** The id of the section the main button scrolls to. */
  topPicksId: string;
}

export function Hero({ topPicksId }: HeroProps) {
  return (
    <Container className="pt-3 sm:pt-4">
      <div className="grid gap-4 2xl:grid-cols-[1fr_22rem] 2xl:gap-0 2xl:rounded-3xl 2xl:bg-surface-muted">
        <section className="relative overflow-hidden rounded-3xl bg-surface-warm lg:min-h-[21rem]">
          <div className="relative z-10 flex flex-col items-start gap-4 px-5 pt-8 sm:px-10 sm:pt-10 lg:pb-10">
            <p className="enter-up text-xs font-semibold tracking-[0.2em] text-ink-muted uppercase">
              Shop smart • Live better
            </p>
            <h1 className="enter-up text-[1.75rem] leading-tight font-extrabold tracking-tight text-ink [--enter-delay:80ms] sm:text-4xl 2xl:text-[2.5rem] 2xl:leading-[1.15]">
              Everything You Need,
              <span className="block text-brand">All in One Place</span>
            </h1>
            <p className="max-w-sm enter-up text-base text-ink-muted [--enter-delay:160ms] sm:text-lg">
              Top brands, great value and hassle-free shopping, handpicked from Flipkart.
            </p>
            <div className="enter-up [--enter-delay:240ms]">
              <ButtonLink href={`#${topPicksId}`} variant="brand" size="lg">
                Explore Now
                <ArrowRightIcon className="size-5" />
              </ButtonLink>
            </div>
          </div>
          <div className="relative mt-4 aspect-[617/325] w-full enter-up hero-photo-fade [--enter-delay:120ms] lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:h-[80%] lg:w-auto xl:h-full">
            <Image
              src={HERO_PHOTO.src}
              alt={HERO_PHOTO.alt}
              width={HERO_PHOTO.width}
              height={HERO_PHOTO.height}
              sizes="(min-width: 1024px) 640px, 100vw"
              preload
              className="size-full object-cover"
            />
          </div>
        </section>
        <div className="enter-up [--enter-delay:320ms] 2xl:grid">
          <TrustPoints />
        </div>
      </div>
    </Container>
  );
}
