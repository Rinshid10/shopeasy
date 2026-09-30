import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

interface AffiliateButtonProps {
  href: string;
  productTitle: string;
  size?: ButtonSize;
}

/** The only place affiliate links are rendered, so the link attributes and label stay consistent. */
export function AffiliateButton({ href, productTitle, size = "md" }: AffiliateButtonProps) {
  return (
    <div className="flex flex-col gap-1">
      <a
        href={href}
        target="_blank"
        rel={siteConfig.affiliate.linkRel}
        className={buttonClasses({ variant: "accent", size, fullWidth: true })}
      >
        <span>
          {siteConfig.affiliate.buttonLabel}
          <span className="sr-only">: {productTitle} (opens in a new tab)</span>
        </span>
        <ExternalLinkIcon className="size-4 shrink-0" />
      </a>
      <p className="text-center text-xs text-ink-muted">{siteConfig.affiliate.linkLabel}</p>
    </div>
  );
}
