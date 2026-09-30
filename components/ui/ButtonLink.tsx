import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/** An internal link styled as a button. For Flipkart links, use AffiliateButton instead. */
export function ButtonLink({ href, variant, size, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses({ variant, size })}>
      {children}
    </Link>
  );
}
