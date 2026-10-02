import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, CashIcon, TagIcon, TruckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

interface OfferBanner {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  icon: ReactNode;
  className: string;
}

interface OfferBannersProps {
  /** The biggest real discount in the catalogue, shown on the first banner. */
  maxDiscountPercent: number;
  /** Where the discount banner leads, e.g. the "Biggest discounts" row. */
  dealsHref: string;
  /** Where the delivery and payment banners lead, e.g. the categories. */
  shopHref: string;
}

/** Three bright promotional cards. Every claim on them comes from the catalogue or store settings. */
export function OfferBanners({ maxDiscountPercent, dealsHref, shopHref }: OfferBannersProps) {
  const allBanners: (OfferBanner | false)[] = [
    {
      eyebrow: "Big savings",
      title: `Up to ${maxDiscountPercent}% off`,
      text: "On fashion, electronics, home and more",
      cta: "See deals",
      href: dealsHref,
      icon: <TagIcon className="size-7" />,
      className: "from-brand to-brand-light text-surface",
    },
    siteConfig.store.deliveryCharge === 0 && {
      eyebrow: "On every order",
      title: "Free Delivery",
      text: "No delivery charge, however small the order",
      cta: "Start shopping",
      href: shopHref,
      icon: <TruckIcon className="size-7" />,
      className: "from-teal to-teal-light text-surface",
    },
    {
      eyebrow: "Pay later",
      title: "Cash on Delivery",
      text: "Pay in cash or UPI when your order arrives",
      cta: "Shop now",
      href: shopHref,
      icon: <CashIcon className="size-7" />,
      className: "from-orange to-orange-light text-surface",
    },
  ];
  const banners = allBanners.filter((banner): banner is OfferBanner => banner !== false);

  return (
    <ul className="-mx-4 scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:auto-cols-fr md:grid-flow-col md:gap-4 md:overflow-visible md:px-0">
      {banners.map((banner) => (
        <li key={banner.title} className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-auto">
          <Link
            href={banner.href}
            className={cn(
              "group relative flex h-full flex-col gap-1 overflow-hidden rounded-3xl bg-linear-to-br p-5 dark-section hover:-translate-y-1 hover:shadow-xl",
              banner.className,
            )}
          >
            <span
              aria-hidden="true"
              className="absolute -top-6 -right-6 size-28 rounded-full bg-surface/15 group-hover:scale-125"
            />
            <span className="relative flex size-12 items-center justify-center rounded-2xl bg-surface/20">
              {banner.icon}
            </span>
            <span className="relative mt-3 text-xs font-semibold tracking-widest uppercase opacity-90">
              {banner.eyebrow}
            </span>
            <span className="relative text-2xl font-extrabold tracking-tight">{banner.title}</span>
            <span className="relative text-sm opacity-90">{banner.text}</span>
            <span className="relative mt-3 inline-flex items-center gap-1.5 text-sm font-bold">
              {banner.cta}
              <ArrowRightIcon className="size-4 group-hover:translate-x-1" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
