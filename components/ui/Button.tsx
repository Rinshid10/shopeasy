import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "brand" | "buy" | "outline" | "outline-brand" | "whatsapp";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "rounded-xl bg-ink text-surface hover:bg-ink-raised",
  brand: "rounded-full bg-brand text-surface shadow-lg shadow-brand/25 hover:bg-brand-strong",
  /** Filled purple: the main buy action. */
  buy: "rounded-xl bg-brand text-surface hover:bg-brand-strong",
  outline: "rounded-xl border border-line bg-surface text-ink hover:border-ink",
  /** Purple outline: the secondary action beside a buy button, e.g. Add to Cart. */
  "outline-brand": "rounded-xl border border-brand bg-surface text-brand hover:bg-brand-soft",
  /** Green: sends something to WhatsApp. */
  whatsapp: "rounded-xl bg-positive text-surface hover:bg-positive/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-2 py-2 text-xs whitespace-nowrap",
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

/** Shared button look, so links that act as buttons match real buttons. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "pressable inline-flex items-center justify-center gap-2 text-center leading-tight font-semibold",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
