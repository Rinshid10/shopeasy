import { FormField, TextInput } from "@/components/checkout/FormField";
import { CheckIcon } from "@/components/ui/icons";
import type { PincodeCheck } from "@/lib/checkout/use-pincode-check";

const PINCODE_NOT_FOUND_MESSAGE = "This PIN code doesn't exist. Please check it.";

interface PincodeFieldProps {
  value: string;
  check: PincodeCheck;
  /** A message from the form's own checks, such as a PIN code that is too short. */
  error?: string;
  onChange: (value: string) => void;
}

/** The PIN code input, with a live result from the India Post check underneath. */
export function PincodeField({ value, check, error, onChange }: PincodeFieldProps) {
  const shownError = error ?? (check.status === "invalid" ? PINCODE_NOT_FOUND_MESSAGE : undefined);

  const hint =
    check.status === "checking" ? (
      <span className="flex items-center gap-1.5">
        <span className="size-3 animate-spin rounded-full border-2 border-line border-t-brand" />
        Checking PIN code…
      </span>
    ) : check.status === "valid" ? (
      <span className="flex items-center gap-1 font-medium text-positive">
        <CheckIcon className="size-3.5" />
        {[check.city, check.state].filter(Boolean).join(", ") || "Valid PIN code"}
      </span>
    ) : undefined;

  return (
    <FormField id="address-pincode" label="PIN code" error={shownError} hint={hint}>
      <TextInput
        id="address-pincode"
        inputMode="numeric"
        autoComplete="postal-code"
        value={value}
        error={shownError}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
      />
    </FormField>
  );
}
