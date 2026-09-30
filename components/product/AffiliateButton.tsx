import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { ShoppingBagIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

interface AffiliateButtonProps {
  href: string;
  productTitle: string;
  size?: ButtonSize;
  /**
   * For product cards in a grid: drops the icon so the label fits on one line, and leaves
   * the "Affiliate link" label to the note under the grid.
   */
  compact?: boolean;
}

/** The only place affiliate links are rendered, so the link attributes and label stay consistent. */
export function AffiliateButton({
  href,
  productTitle,
  size = "md",
  compact = false,
}: AffiliateButtonProps) {
  const { buttonLabel, linkLabel, linkRel } = siteConfig.affiliate;

  return (
    <div className="flex flex-col gap-1.5">
      <a
        href={href}
        target="_blank"
        rel={linkRel}
        className={buttonClasses({ variant: "primary", size, fullWidth: true })}
      >
        {!compact && <ShoppingBagIcon className="size-4 shrink-0" />}
        <span>
          {buttonLabel}
          <span className="sr-only">: {productTitle} (opens in a new tab)</span>
        </span>
      </a>
      {!compact && <p className="text-center text-xs leading-none text-ink-muted">{linkLabel}</p>}
    </div>
  );
}
