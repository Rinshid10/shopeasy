import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  /** The control; it must use the same id so the label is linked to it. */
  children: ReactNode;
}

/** A label, a control and its error message, laid out consistently. */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-negative">
          {error}
        </p>
      ) : (
        hint && (
          <p aria-live="polite" className="text-xs text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Shared look for text inputs and selects; red border when there is an error. */
export function fieldControlClasses(hasError: boolean): string {
  return cn(
    "h-12 w-full rounded-xl border bg-surface px-3.5 text-base text-ink transition-colors placeholder:text-ink-soft focus:border-brand",
    hasError ? "border-negative" : "border-line",
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string };

export function TextInput({ id, error, className, ...props }: TextInputProps) {
  return (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(fieldControlClasses(Boolean(error)), className)}
      {...props}
    />
  );
}
